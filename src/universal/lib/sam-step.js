import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";
import FunctionTree from "function-tree";
import { getId } from "../lib/util";

export function samStepFactory({
  propose,
  computeControlState,
  computeNextAction,
  controlState,
  allowedActions,
}) {
  const GetId = getId();
  const stepId = GetId.next().value;

  return function samStep(action) {
    if (Array.isArray(action)) {
      const [name, tree] = action;
      action = { name, tree };
    } else if (
      Object.prototype.toString.call(action) !== "[object Function]" ||
      !action.name.length
    ) {
      throw new Error(
        "Action must have a name. Provide a named function or an array ([name, [functionTree]])",
      );
    }

    return {
      signal: [
        ...ensureSamStateFactory(stepId, controlState, allowedActions),
        ...warnInterruptedActionFactory(action),
        guardStepInProgress,
        {
          false: [warnBlockedActionFactory(action)],
          true: [
            set(state`sam.actionInProgress`, true),
            guardActionAllowed(action),
            {
              false: [warnDisallowedActionFactory(action)],
              true: [
                set(props`_stepId`, state`sam.stepId`),
                getProposalFactory(action),
                guardStaleAction,
                {
                  false: [warnStaleActionFactory(action)],
                  true: [
                    incrementStepIdFactory(GetId),
                    set(state`sam.stepInProgress`, true),
                    function proposeProposal(input) {
                      return propose(input);
                    },
                    getControlStateFactory(computeControlState),
                    guardInvalidControlState,
                    {
                      false: [throwErrorFactory("Invalid control state.")],
                      true: [
                        set(state`sam.controlState`, props`controlState`),
                        getNextActionFactory(computeNextAction),
                        when(props`signalPath`),
                        {
                          false: [
                            set(state`sam.stepInProgress`, false),
                            set(state`sam.actionInProgress`, false),
                            set(state`sam.napInProgress`, false),
                          ],
                          true: [
                            // TODO: Check if blockStep is useful.
                            set(state`sam.stepInProgress`, props`blockStep`),
                            set(state`sam.napInProgress`, true),
                            runNextAction,
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      catch: new Map([[Error, [handleError]]]),
    };
  };
}

export const ensureSamStateFactory = (stepId, controlState, allowedActions) => [
  when(state`sam`),
  {
    false: [
      set(state`sam`, samStateFactory(stepId, controlState, allowedActions)),
    ],
    true: [set(state`sam.init`, false)],
  },
];

export const warnInterruptedActionFactory = action => [
  when(
    state`sam.actionInProgress`,
    props`_isNap`,
    (actionInProgress, isNap) => actionInProgress && !isNap,
  ),
  {
    false: [],
    true: [
      ({ props }) => {
        console.warn("Action interrupted pending action.", action.name, props);
      },
    ],
  },
];

export const samStateFactory = (stepId, controlState, allowedActions) => ({
  init: true,
  stepId,
  controlState: { name: controlState, allowedActions },
  stepInProgress: false,
  actionInProgress: false,
});

export const incrementStepIdFactory = generator =>
  function setStepId({ state }) {
    state.set("sam.stepId", generator.next().value);
  };

export const guardStepInProgress = when(
  state`sam.napInProgress`,
  state`sam.stepInProgress`,
  props`_isNap`,
  (napInProgress, stepInProgress, isNap) =>
    (!napInProgress && !stepInProgress) || isNap,
);

export const guardActionAllowed = action =>
  when(
    state`sam.controlState`,
    controlState =>
      !controlState.name || controlState.allowedActions.includes(action.name),
  );

export const getProposalFactory = action =>
  function getProposal({ props }) {
    return action.tree
      ? new Promise(resolve => {
          new FunctionTree()(action.tree, props, (self, execution, payload) => {
            resolve(payload);
          });
        })
      : action({ input: props });
  };

export const guardStaleAction = when(
  state`sam.init`,
  state`sam.stepId`,
  props`_stepId`,
  (init, stepId, actionStepId) => init || stepId === actionStepId,
);

export const guardInvalidControlState = when(
  props`controlState.name`,
  controlStateName => !!controlStateName,
);

export const getControlStateFactory = computeControlState =>
  function getControlState({ state }) {
    const [name, allowedActions] = computeControlState(state.get());
    return { controlState: { name, allowedActions } };
  };

export const getNextActionFactory = computeNextAction =>
  function getNextAction({ state }) {
    const [signalPath, signalInput, blockStep = false] = computeNextAction(
      state.get("sam.controlState.name"),
    ) || [];

    return {
      signalPath,
      signalInput,
      blockStep,
    };
  };

export function runNextAction({ props, controller }) {
  setImmediate(() => {
    const { signalPath, signalInput } = props;
    const samStep = controller.module.signals[signalPath];
    try {
      controller.runSignal(signalPath, samStep.signal, {
        ...signalInput,
        _isNap: true,
      });
    } catch (error) {
      controller.runSignal(signalPath, Array.from(samStep.catch.values()), {
        error,
      });
    }
  });
}

export const warnStaleActionFactory = action =>
  function warnStaleAction({ state, props }) {
    console.warn(
      `Stale action blocked at step-ID=${state.get("sam.stepId")}:`,
      action.name,
      props,
      state.get("sam"),
    );
  };

export const warnBlockedActionFactory = action =>
  function warnBlockedAction({ state, props }) {
    // TODO: Queue action?
    console.warn(
      "Action blocked, step in progress:",
      action.name,
      props,
      state.get("sam"),
    );
  };

export const warnDisallowedActionFactory = action =>
  function warnDisallowedAction({ state, props }) {
    console.warn(
      "Action blocked, not allowed in step:",
      action.name,
      props,
      state.get("sam"),
    );
  };

export function handleError({ props: { error } }) {
  console.error("SAM step catched an error", error);
}

export const throwErrorFactory = msg =>
  function throwError() {
    throw new Error(msg);
  };
