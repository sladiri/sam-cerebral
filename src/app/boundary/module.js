import { Controller } from "cerebral";
import Devtools from "cerebral/devtools";
import R from "ramda";
import { samStepFactory } from "../../lib/sam-step";
import { defaultState, propose } from "../entity";
import {
  increase,
  decrease,
  cancel,
  computeControlState,
  computeNextAction,
} from "../control";
import findJobBrute from "../../napsack";

const samStep = samStepFactory({
  propose,
  computeControlState,
  computeNextAction,
});

export const module = (function() {
  const result = Controller({
    state: defaultState,
    signals: {
      init: samStep(R.always({})),
      increase: samStep(increase),
      decrease: samStep(decrease),
      cancel: samStep(cancel),
      napsack: samStep(findJobBrute),
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

function logError({ props: { error } }) {
  console.error("App catched an error", error);
}
