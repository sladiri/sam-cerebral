import { Controller } from "cerebral";
import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import Devtools from "cerebral/devtools";
import R from "ramda";
import { samStepFactory } from "../lib/sam-step";
import { defaultState, propose } from "./entity";
import { actions, computeControlState, computeNextAction } from "./control";
import { views } from "./view";

const samStep = samStepFactory({
  propose,
  computeControlState,
  computeNextAction,
});

export const controller = (function() {
  const result = Controller({
    state: defaultState,
    signals: {
      init: samStep(R.always({})),
      increase: samStep(actions.increase),
      decrease: samStep(actions.decrease),
      cancel: samStep(actions.cancel),
    },
    catch: new Map([[Error, logError]]),
    devtools: Devtools({ remoteDebugger: "localhost:8585", reconnect: true }),
  });

  result.on("start", (execution, payload) => {
    console.log("function tree start", { execution, payload });
  });

  result.on("end", (execution, payload) => {
    console.log("function tree end", { execution, payload });
  });

  result.getSignal("init")({});

  return result;
})();

export const component = connect(
  {
    controlStateName: state`sam.controlState.name`,
    count: state`count`,
    actionsDisabled: state`sam.stepInProgress`,
    increase: signal`increase`,
    decrease: signal`decrease`,
    cancel: signal`cancel`,
  },
  // Documentation example: Function can be omitted in simple cases.
  // function computeAppViewModel(connectedProps, parentProps, resolve) {
  //   return {
  //     ...parentProps,
  //     ...connectedProps,
  //   };
  // },
  function App({ controlStateName, ...props }) {
    const view = views[controlStateName];
    return view ? view(props) : null;
  },
);

function logError({ props: { error } }) {
  console.error("App catched an error", error);
}
