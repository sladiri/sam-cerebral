import { samFactory } from "../../sam-step";
import { defaultState, accept } from "../entity";
import {
  init,
  abort,
  card,
  pin,
  changeBalance,
  computeControlState,
  computeNextAction,
} from "../control";

const samStep = samFactory({
  prefix: "atm",
  accept,
  computeControlState,
  computeNextAction,
  controlState: "normal",
  allowedActions: ["init"],
});

export const atmInit = [samStep(init)];

export default () => ({
  state: defaultState,
  signals: {
    init: atmInit,
    abort: [samStep(abort)],
    card: [samStep(card)],
    pin: [samStep(pin)],
    changeBalance: samStep(changeBalance),
  },
  catch: new Map([[Error, logError]]),
});

function logError({ props: { error } }) {
  console.error("ATM catched an error", error);
}
