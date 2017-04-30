import { set, when, unset } from "cerebral/operators";
import { state, props } from "cerebral/tags";

const ensureSamState = [
  when(state`sam`),
  {
    true: [],
    false: [set(state`sam`, {})],
  },
];

const guardSamStep = when(
  state`sam.stepInProgress`,
  state`sam.napInProgress`,
  (step, nap) => step && !nap,
);

export function samStepFactory({
  propose,
  computeControlState,
  nextActionPredicate,
}) {
  return function samStep(action) {
    return {
      signal: [
        ...ensureSamState,
        guardSamStep,
        {
          true: [warnBlockedAction],
          false: [
            set(state`sam.stepInProgress`, true),
            getProposal(action),
            propose,
            getControlState,
            when(props`controlState`, controlState => !!controlState),
            {
              false: [() => throwError("Invalid control state.")],
              true: [
                set(state`sam.controlState`, props`controlState`),
                getNextAction,
                when(props`nextAction`),
                {
                  true: [set(state`sam.napInProgress`, true), runNextAction],
                  false: [
                    set(state`sam.napInProgress`, false),
                    set(state`sam.stepInProgress`, false),
                  ],
                },
              ],
            },
          ],
        },
      ],
      catch: new Map([[Error, [logError]]]),
    };

    function getControlState({ state }) {
      return { controlState: computeControlState(state.get()) };
    }

    function getNextAction({ state }) {
      return { nextAction: nextActionPredicate(state.get("sam.controlState")) };
    }
  };
}

function getProposal(action) {
  return ({ props, state }) => action(props, state);
}

function runNextAction({ props: { nextAction }, controller }) {
  const [signalPath, data] = nextAction;
  return controller.getSignal(signalPath)(data);
}

function warnBlockedAction(action) {
  return ({ props }) => {
    console.warn("Action blocked, props:", action.name, props);
  };
}

function logError({ props: { error } }) {
  console.error("sam catched error", error.stack);
}

function throwError(msg) {
  throw new Error(msg);
}
