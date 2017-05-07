import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";

export function samStepFactory({
  propose,
  computeControlState,
  computeNextAction,
}) {
  return function samStep(action) {
    return {
      signal: [
        ...ensureSamState,
        when(state`sam.stepInProgress`),
        {
          true: [warnBlockedActionFactory(action)],
          false: [
            set(state`sam.stepInProgress`, true),
            getProposalFactory(action),
            propose,
            getControlStateFactory(computeControlState),
            when(props`controlState`, controlState => !!controlState),
            {
              false: [throwErrorFactory("Invalid control state.")],
              true: [
                set(state`sam.controlState`, props`controlState`),
                set(state`sam.stepInProgress`, false),
                runNextActionFactory(computeNextAction),
              ],
            },
          ],
        },
      ],
      catch: new Map([[Error, [handleError]]]),
    };
  };
}

export const getProposalFactory = action =>
  function getProposal({ props }) {
    return action(props);
  };

export const getControlStateFactory = computeControlState =>
  function getControlState({ state }) {
    return { controlState: computeControlState(state.get()) };
  };

export const runNextActionFactory = computeNextAction =>
  function runNextAction({ state, controller }) {
    const [signalPath, signalInput] = computeNextAction(
      state.get("sam.controlState"),
    ) || [];

    if (signalPath) {
      setImmediate(() => {
        const samStep = controller.module.signals[signalPath];
        try {
          controller.runSignal(signalPath, samStep.signal, signalInput);
        } catch (error) {
          controller.runSignal(signalPath, Array.from(samStep.catch.values()), {
            error,
          });
        }
      });
    }
  };

export const warnBlockedActionFactory = action =>
  function warnBlockedAction({ props }) {
    console.warn("Action blocked, props:", action.name, props);
  };

export const samState = {
  controlState: "",
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

export function handleError({ props: { error } }) {
  console.error("sam catched error", error);
}

export const throwErrorFactory = msg =>
  function throwError() {
    throw new Error(msg);
  };
