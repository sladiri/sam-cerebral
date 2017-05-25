import Devtools from "cerebral/devtools";
import { samStepFactory } from "../../lib/sam-step";
import { defaultState, proposeFactory } from "../entity";
import {
  init,
  findJobBrute,
  cancel,
  computeControlState,
  computeNextAction,
} from "../control";

const samStep = samStepFactory({
  prefix: "napSack",
  propose: proposeFactory("napSack"),
  computeControlState,
  computeNextAction,
  controlState: "normal",
  allowedActions: ["init", "findJobBrute"],
});

export default {
  state: defaultState,
  signals: {
    init: samStep(init),
    findJobBrute: samStep(findJobBrute),
    cancel: samStep(cancel),
  },
  catch: new Map([[Error, logError]]),
  devtools: typeof window !== "undefined"
    ? Devtools({ remoteDebugger: "localhost:8585", reconnect: true })
    : undefined,
};

function logError({ props: { error } }) {
  console.error("Nap-sack catched an error", error);
}
