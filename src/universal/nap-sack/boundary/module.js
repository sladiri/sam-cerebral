import { samFactory } from "../../sam-step";
import {
  defaultState,
  accept,
  computeControlState,
  computeNextAction,
} from "../entity";
import { init, findJobBrute, cancel } from "../control";

export default () => {
  const signals = samFactory({
    prefix: "napSack",
    accept,
    computeControlState,
    computeNextAction,
    controlState: "normal",
    allowedActions: ["init"],
    actions: { init, findJobBrute, cancel },
  });

  return {
    init: signals.init,
    module: {
      state: defaultState,
      signals,
    },
  };
};
