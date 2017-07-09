import { samFactory } from "../../sam-step";
import {
  defaultState,
  accept,
  computeControlState,
  computeNextAction,
} from "../entity";
import { init, login, post, deletePost, cancel } from "../control";

export default () => {
  const signals = samFactory({
    prefix: "blog",
    accept,
    computeControlState,
    computeNextAction,
    controlState: "normal",
    allowedActions: ["init"],
    actions: { init, login, post, deletePost, cancel },
  });

  return {
    init: signals.init,
    module: {
      state: defaultState,
      signals,
    },
  };
};
