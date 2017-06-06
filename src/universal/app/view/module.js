import { Controller } from "cerebral";
import Devtools from "cerebral/devtools";
import { samStepFactory } from "../../lib/sam-step";
import { defaultState, propose } from "../entity";
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
  propose,
  computeControlState,
  computeNextAction,
  controlState: "normal",
  allowedActions: ["init"],
});

export default do {
  const result = Controller({
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
      ? Devtools({ remoteDebugger: "localhost:8585", reconnect: true })
      : undefined,
  });

  // result.on("start", (execution, payload) => {
  //   console.log("function tree start", { execution, payload });
  // });

  // result.on("end", (execution, payload) => {
  //   console.log("function tree end", { execution, payload });
  // });

  // result.on("functionStart", (execution, functionDetails, payload) => {
  //   if (functionDetails.name === "proposeProposal")
  //     console.log("function tree functionStart", functionDetails.name, payload);
  // });

  result.getSignal("init")({});
  result.getSignal("napSack.init")({});

  result;
};

function logError({ props: { error } }) {
  console.error("App catched an error", error);
}
