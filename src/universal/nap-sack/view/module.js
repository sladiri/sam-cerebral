import { Controller } from "cerebral";
import Devtools from "cerebral/devtools";
import { samStepFactory } from "../../lib/sam-step";
import { defaultState, propose } from "../entity";
import {
  init,
  findJobBrute,
  cancel,
  computeControlState,
  computeNextAction,
} from "../control";

const samStep = samStepFactory({
  propose,
  computeControlState,
  computeNextAction,
  controlState: "normal",
  allowedActions: ["init", "findJobBrute"],
});

export default do {
  const result = Controller({
    state: defaultState,
    signals: {
      init: samStep(init),
      findJobBrute: samStep(findJobBrute),
      cancel: samStep(cancel),
    },
    catch: new Map([[Error, logError]]),
    devtools: typeof window !== "undefined"
      ? Devtools({ remoteDebugger: "localhost:8586", reconnect: true })
      : undefined,
  });

  result.getSignal("init")({});

  result;
};

function logError({ props: { error } }) {
  console.error("Nap-sack catched an error", error);
}
