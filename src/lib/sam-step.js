import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";
import { getId } from "../lib/util";

export function samStepFactory({
  propose,
  computeControlState,
  computeNextAction,
}) {
  const GetId = getId();
  const stepId = GetId.next().value;

  return function samStep(action) {
    return {
      signal: [
        ...ensureSamStateFactory(stepId),
        guardStepInProgress,
        {
          false: [warnBlockedActionFactory(action)],
          true: [
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
                    setStepIdFactory(GetId),
                    set(state`sam.stepInProgress`, true),
                    propose,
                    getControlStateFactory(computeControlState),
                    guardInvalidControlState,
                    {
                      false: [throwErrorFactory("Invalid control state.")],
                      true: [
                        set(state`sam.controlState`, props`controlState`),
                        getNextActionFactory(computeNextAction),
                        when(props`signalPath`),
                        {
                          false: [set(state`sam.stepInProgress`, false)],
                          true: [
                            set(state`sam.stepInProgress`, props`blockStep`),
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

export const samStateFactory = stepId => ({
  init: false,
  stepId,
  controlState: {},
  stepInProgress: false,
});

export const ensureSamStateFactory = stepId => [
  when(state`sam`),
  {
    false: [set(state`sam`, samStateFactory(stepId))],
    true: [],
  },
  when(state`sam.init`),
  {
    false: [set(state`sam.init`, true)],
    true: [],
  },
];

export const setStepIdFactory = generator =>
  function setStepId({ state }) {
    state.set("sam.stepId", generator.next().value);
  };

export const guardStepInProgress = when(
  state`sam.stepInProgress`,
  props`_isNap`,
  (step, isNap) => !step || isNap,
);

export const guardActionAllowed = action =>
  when(
    state`sam.controlState`,
    controlState =>
      !controlState.name || controlState.allowedActions.includes(action.name),
  );

export const getProposalFactory = action =>
  function getProposal({ props }) {
    return action(props);
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
