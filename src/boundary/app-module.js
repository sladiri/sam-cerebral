import { Controller } from "cerebral";
import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import Devtools from "cerebral/devtools";
import R from "ramda";
import getView from "./app-view";
import { samStepFactory } from "../lib/sam-step";
import { defaultState, propose } from "../entity/app-model";
import {
  computeControlState,
  computeNextAction,
} from "../control/app-controller";
import { increase, decrease, cancel } from "../boundary/actions";

function logError({ props: { error } }) {
  console.error("App catched an error", error);
}

const samStep = samStepFactory({
  propose,
  computeControlState,
  computeNextAction,
});

export const AppController = (function() {
  const result = Controller({
    state: defaultState,
    signals: {
      init: samStep(R.always({})),
      increase: samStep(increase),
      decrease: samStep(decrease),
      cancel: samStep(cancel),
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

export const App = connect(
  {
    count: state`count`,
    disabled: state`sam.stepInProgress`,
    controlState: state`sam.controlState.name`,
    increase: signal`increase`,
    decrease: signal`decrease`,
    cancel: signal`cancel`,
  },
  function App({ controlState, ...props }) {
    return getView(controlState, props);
  },
);
