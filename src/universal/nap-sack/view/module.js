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
  prefix: "napSack",
  propose,
  computeControlState,
  computeNextAction,
  controlState: "normal",
  allowedActions: ["init"],
});

export default {
  state: defaultState,
  signals: {
    init: samStep(init),
    findJobBrute: samStep(findJobBrute),
    cancel: samStep(cancel),
  },
  catch: new Map([[Error, logError]]),
};

function logError({ props: { error } }) {
  console.error("NapSack catched an error", error);
}
