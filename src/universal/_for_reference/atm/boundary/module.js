import { samFactory } from "../../sam-step";
import {
  defaultState,
  accept,
  computeControlState,
  computeNextAction,
} from "../entity";
import { init, abort, card, pin, changeBalance } from "../control";

export default () => {
  const signals = samFactory({
    prefix: "atm",
    accept,
    computeControlState,
    computeNextAction,
    controlState: "normal",
    allowedActions: ["init"],
    actions: { init, abort, card, pin, changeBalance },
  });

  return {
    init: signals.init,
    module: {
      state: defaultState,
      signals,
    },
  };
};
