import Devtools from "cerebral/devtools";
import { samStepFactory } from "../../sam-step";
import { defaultState, accept } from "../entity";
import {
  init,
  increase,
  decrease,
  cancel,
  computeControlState,
  computeNextAction,
} from "../control";
import { module as napSack } from "../../nap-sack/boundary";

const samStep = samStepFactory({
  accept,
  computeControlState,
  computeNextAction,
  controlState: "normal",
  allowedActions: ["init"],
});

export default {
  modules: {
    napSack,
  },
  state: defaultState,
  signals: {
    // name: ...stuff outside of SAM, "blocking" SAM stuff,
    init: samStep(init),
    increase: samStep(["increase", [increase]]), // Example of action-tree.
    decrease: samStep(decrease),
    cancel: samStep(cancel),
  },
  catch: new Map([[Error, logError]]),
  // Add a global provider when module instantiates
  // provider(context, functionDetails, payload) {},
  // TODO: Cerebral should support server-side?
  devtools: typeof window !== "undefined"
    ? Devtools({ host: "localhost:8585", reconnect: true })
    : undefined,
};

function logError({ props: { error } }) {
  console.error("App catched an error", error);
}
