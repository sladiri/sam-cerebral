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
          true: [warnBlockedActionFactory(action)],
          false: [
            set(state`sam.init`, false),
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

export const samStateFactory = stepId => ({
  init: true,
  stepId,
  controlState: {},
  stepInProgress: false,
  napInProgress: false,
});

export const ensureSamStateFactory = stepId => [
  when(state`sam`),
  {
    true: [],
    false: [set(state`sam`, samStateFactory(stepId))],
  },
];

export const setStepIdFactory = generator =>
  function setStepId({ state }) {
    state.set("sam.stepId", generator.next().value);
  };

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

export function handleError({ props: { error } }) {
  console.error("SAM step catched an error", error);
}

export const throwErrorFactory = msg =>
  function throwError() {
    throw new Error(msg);
  };
