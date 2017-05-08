import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";
import increment from "../lib/cerebral-increment-operator";

export function samStepFactory({
  propose,
  computeControlState,
  computeNextAction,
}) {
  return function samStep(action) {
    return {
      signal: [
        ...ensureSamState,
        guardStepInProgress,
        {
          true: [warnBlockedActionFactory(action)],
          false: [
            set(props`_stepId`, state`sam.stepId`),
            getProposalFactory(action),
            guardStaleAction,
            {
              false: [warnStaleActionFactory(action)],
              true: [
                increment(state`sam.stepId`),
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
                      true: [
                        set(state`sam.napInProgress`, true),
                        runNextAction,
                      ],
                      false: [
                        set(state`sam.stepInProgress`, false),
                        set(state`sam.napInProgress`, false),
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

export const samState = {
  stepId: -1,
  controlState: {},
  stepInProgress: false,
  napInProgress: false,
};

export const ensureSamState = [
  when(state`sam`),
  {
    true: [],
    false: [set(state`sam`, samState)],
  },
];

export const guardStepInProgress = when(
  state`sam.stepInProgress`,
  state`sam.napInProgress`,
  props`isNap`,
  (step, nap, isNap) => (step && !nap) || (step && nap && !isNap),
);

export const getProposalFactory = action =>
  function getProposal({ props }) {
    return action(props);
  };

export const guardStaleAction = when(
  state`sam.stepId`,
  props`_stepId`,
  (stepId, actionStepId) => stepId === -1 || stepId === actionStepId,
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
    const [signalPath, signalInput] = computeNextAction(
      state.get("sam.controlState.name"),
    ) || [];

    return { signalPath, signalInput };
  };

export function runNextAction({ props, controller }) {
  setImmediate(() => {
    const { signalPath, signalInput } = props;
    const samStep = controller.module.signals[signalPath];
    try {
      controller.runSignal(signalPath, samStep.signal, {
        ...signalInput,
        isNap: true,
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
    );
  };

export const warnBlockedActionFactory = action =>
  function warnBlockedAction({ props }) {
    // TODO: Queue action?
    console.warn("Action blocked, step in progress:", action.name, props);
  };

export function handleError({ props: { error } }) {
  console.error("sam catched error", error);
}

export const throwErrorFactory = msg =>
  function throwError() {
    throw new Error(msg);
  };
