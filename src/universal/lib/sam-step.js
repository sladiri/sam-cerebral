import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";
import FunctionTree from "function-tree";
import { getId, getModulePath } from "../lib/util";

export function samStepFactory({
  prefix,
  propose,
  computeControlState,
  computeNextAction,
  controlState,
  allowedActions,
}) {
  const prefixedPath = getModulePath(prefix);
  const GetId = getId();
  const stepId = GetId.next().value;

  return function samStep(action) {
    action = handleActionTree(action);

    if (!action) {
      throw new Error(
        "Action must have a name. Provide a named function or an array ([name, [functionTree]])",
      );
    }

    return {
      signal: [
        ...ensureSamStateFactory(
          prefixedPath,
          stepId,
          controlState,
          allowedActions,
        ),
        guardDisallowedActionFactory(action.name, prefixedPath),
        {
          false: [logDisallowedActionFactory(action.name, prefixedPath)],
          true: [
            ...logPossibleInterruptFactory(action.name, prefixedPath),
            guardSignalInterruptFactory(prefixedPath),
            {
              false: logInterruptFailedFactory(action.name, prefixedPath),
              true: [
                set(
                  state`${prefixedPath("sam.proposeInProgress")}`,
                  action.name,
                ),
                set(props`_stepId`, state`${prefixedPath("sam.stepId")}`),
                getProposalFactory(action),
                guardStaleActionFactory(prefixedPath),
                {
                  false: [logStaleActionFactory(action.name, prefixedPath)],
                  true: [
                    incrementStepIdFactory(GetId, prefixedPath),
                    set(
                      state`${prefixedPath("sam.acceptAndNapInProgress")}`,
                      true,
                    ),
                    function proposeProposal(input) {
                      return propose(input);
                    },
                    getControlStateFactory(computeControlState),
                    when(
                      props`controlState.name`,
                      controlStateName => !!controlStateName,
                    ),
                    {
                      false: [
                        () => {
                          throw new Error("Invalid control state.");
                        },
                      ],
                      true: [
                        set(
                          state`${prefixedPath("sam.controlState")}`,
                          props`controlState`,
                        ),
                        getNextActionFactory(computeNextAction, prefixedPath),
                        ({ state, props }) => {
                          state.set(
                            prefixedPath("sam.proposeInProgress"),
                            false,
                          );
                          state.set(
                            prefixedPath("sam.napInProgress"),
                            props.signalPath,
                          );
                          // TODO: Check if blockStep is useful.
                          state.set(
                            prefixedPath("sam.acceptAndNapInProgress"),
                            props.blockStep,
                          );
                        },
                        when(props`signalPath`),
                        {
                          false: [],
                          true: [runNextAction],
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
      catch: new Map([
        [
          Error,
          [
            ({ props: { error } }) => {
              console.error("SAM step catched an error", error);
            },
          ],
        ],
      ]),
    };
  };
}

export const handleActionTree = action => {
  if (Array.isArray(action)) {
    const [name, tree] = action;
    action = { name, tree };
  } else if (
    Object.prototype.toString.call(action) !== "[object Function]" ||
    !action.name.length
  ) {
    action = null;
  }
  return action;
};

export const ensureSamStateFactory = (
  prefixedPath,
  stepId,
  controlState,
  allowedActions,
) => [
  when(state`${prefixedPath("sam")}`),
  {
    false: [
      set(
        state`${prefixedPath("sam")}`,
        samStateFactory(stepId, controlState, allowedActions),
      ),
    ],
    true: [set(state`${prefixedPath("sam.init")}`, false)],
  },
];

export const samStateFactory = (stepId, controlState, allowedActions) => ({
  init: true,
  stepId,
  controlState: { name: controlState, allowedActions },
  proposeInProgress: false,
  acceptAndNapInProgress: false,
  napInProgress: false,
});

export const guardDisallowedActionFactory = (actionName, prefixedPath) =>
  when(
    state`${prefixedPath("sam.controlState")}`,
    controlState =>
      !controlState.name || controlState.allowedActions.includes(actionName),
  );

export const logDisallowedActionFactory = (actionName, prefixedPath) => ({
  state,
  props,
}) => {
  const sam = state.get(prefixedPath("sam"));
  console.warn(
    `Disallowed action [${prefixedPath(
      actionName,
    )}] blocked in control-state [${sam.controlState
      .name}] in step-ID [${sam.stepId}]. Props:`,
    props,
  );
};

export const logPossibleInterruptFactory = (actionName, prefixedPath) => [
  when(
    state`${prefixedPath("sam.proposeInProgress")}`,
    state`${prefixedPath("sam.napInProgress")}`,
    (proposeInProgress, napInProgress) => proposeInProgress && !napInProgress,
  ),
  {
    false: [],
    true: [
      ({ state, props }) => {
        const sam = state.get(prefixedPath("sam"));
        console.warn(
          `Possible cancelation by action [${prefixedPath(
            actionName,
          )}] for pending action [${prefixedPath(
            sam.proposeInProgress,
          )}] in step-ID [${sam.stepId}]. Props:`,
          props,
        );
      },
    ],
  },
];

export const guardSignalInterruptFactory = prefixedPath =>
  when(
    state`${prefixedPath("sam.napInProgress")}`,
    state`${prefixedPath("sam.acceptAndNapInProgress")}`,
    props`_isNap`,
    (napInProgress, acceptAndNapInProgress, isNap) =>
      (!napInProgress && !acceptAndNapInProgress) || isNap,
  );

export const logInterruptFailedFactory = (actionName, prefixedPath) => [
  ({ state, props }) => {
    // If GUI allows clicks while model's propose or NAP is in progress, log a warning.
    const sam = state.get(prefixedPath("sam"));
    const progressMsg = sam.napInProgress
      ? `automatic (NAP) action [${prefixedPath(
          sam.napInProgress,
        )}] for control-state [${sam.controlState.name}]`
      : `accept and NAP for action [${prefixedPath(sam.proposeInProgress)}]`;
    console.warn(
      `Blocked action [${prefixedPath(
        actionName,
      )}], ${progressMsg} in progress in step-ID [${sam.stepId}]. Props:`,
      props,
    );
  },
];

export const guardStaleActionFactory = prefixedPath =>
  when(
    state`${prefixedPath("sam.init")}`,
    state`${prefixedPath("sam.stepId")}`,
    props`_stepId`,
    (init, stepId, actionStepId) => init || stepId === actionStepId,
  );

export const logStaleActionFactory = (actionName, prefixedPath) => ({
  state,
  props,
}) => {
  console.warn(
    `Canceled action [${prefixedPath(actionName)}] in step-ID [${state.get(
      prefixedPath("sam.stepId"),
    )}]. Props:`,
    props,
  );
};

export const incrementStepIdFactory = (generator, prefixedPath) =>
  function setStepId({ state }) {
    state.set(prefixedPath("sam.stepId"), generator.next().value);
  };

export const getProposalFactory = action =>
  function getProposal({ props }) {
    return action.tree
      ? new Promise(resolve => {
          new FunctionTree()(
            action.tree,
            props,
            (self, execution, payload = {}) => {
              resolve(payload);
            },
          );
        })
      : action({ input: props }) || {};
  };

export const getControlStateFactory = computeControlState =>
  function getControlState({ state }) {
    const [name, allowedActions] = computeControlState(state.get());
    return { controlState: { name, allowedActions } };
  };

export const getNextActionFactory = (computeNextAction, prefixedPath) =>
  function getNextAction({ state }) {
    const [signalPath = false, signalInput, blockStep = false] =
      computeNextAction(state.get(prefixedPath("sam.controlState.name"))) || [];

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
        _isNap: true, // TODO: Secure this
      });
    } catch (error) {
      controller.runSignal(signalPath, Array.from(samStep.catch.values()), {
        error,
      });
    }
  });
}
