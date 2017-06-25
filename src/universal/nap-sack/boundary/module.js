import { samFactory } from "../../sam-step";
import {
  defaultState,
  accept,
  computeControlState,
  computeNextAction,
} from "../entity";
import { init, findJobBrute, cancel } from "../control";

const samStep = samFactory({
  prefix: "napSack",
  accept,
  computeControlState,
  computeNextAction,
  controlState: "normal",
  allowedActions: ["init"],
});

export const napSackInit = [samStep(init)];

export default () => ({
  state: defaultState,
  signals: {
    init: napSackInit,
    findJobBrute: [samStep(findJobBrute)],
    cancel: [samStep(cancel)],
  },
  catch: new Map([[Error, logError]]),
});

function logError({ props: { error } }) {
  console.error("NapSack catched an error", error);
}
