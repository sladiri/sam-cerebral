import { samStepFactory } from "../../sam-step";
import { defaultState, accept } from "../entity";
import {
  init,
  insertCard,
  computeControlState,
  computeNextAction,
} from "../control";

const samStep = samStepFactory({
  prefix: "atm",
  accept,
  computeControlState,
  computeNextAction,
  controlState: "normal",
  allowedActions: ["init"],
});

export const atmInit = samStep(init);

export default {
  state: defaultState,
  signals: {
    init: atmInit,
    insertCard: samStep(insertCard),
  },
  catch: new Map([[Error, logError]]),
};

function logError({ props: { error } }) {
  console.error("ATM catched an error", error);
}
