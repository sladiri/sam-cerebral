import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";

export function samStepFactory({
  actions,
  nextActionMap,
  propose,
  computeControlState,
  nextActionPredicate,
}) {
  return function samStep(action) {
    const accept = [
      propose,
      computeControlState,
      nextActionPredicateFactory({ actions, nextActionMap }),
    ];

    return [
      when(state`block`, block => block.stepInProgress && !block.napInProgress),
      {
        true: [warnBlockedAction],
        false: [
          set(state`block.stepInProgress`, true),
          // disableMutations,
          action,
          ...accept,
          when(props`nextAction`),
          {
            true: [set(state`block.napInProgress`, true), getSignalFromAction],
            false: [
              set(state`block.napInProgress`, false),
              set(state`block.stepInProgress`, false),
              // enableMutations,
            ],
          },
        ],
      },
    ];

    function warnBlockedAction({ props }) {
      console.warn("Action blocked, props:", {
        action: action.name,
        props,
      });
    }
  };

  function nextActionPredicateFactory({ actions, nextActionMap }) {
    return function nextActionPredicate({ state }) {
      const controlState = state.get("control");
      return { nextAction: nextActionMap[controlState] };
    };
  }

  function getSignalFromAction({ props: { nextAction }, controller }) {
    const [signalPath, data] = nextAction();
    return controller.getSignal(signalPath)(data);
  }

  // const dummyMutation = (path, value) => {
  //   console.warn(
  //     "Mutation blocked, mutation must happen inside model (propose).",
  //     { path, value },
  //   );
  // };
  // let mutations;
  
  // function disableMutations({ state }) {
  //   mutations = Object.keys(state).reduce((acc, key) => {
  //     acc[key] = state[key];
  //     return acc;
  //   }, {});
  //   Object.keys(state).filter(key => key !== "get").forEach(key => {
  //     state[key] = dummyMutation;
  //   });
  // }

  // function enableMutations({ state }) {
  //   Object.keys(state).filter(key => key !== "get").forEach(key => {
  //     state[key] = mutations[key];
  //   });
  // }

  function betterAPI(state) {
    return;
  }
}
