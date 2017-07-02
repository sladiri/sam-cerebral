import { samFactory, addSamState } from "../../sam-step";
import {
  defaultState,
  accept,
  computeControlState,
  computeNextAction,
} from "../entity";
import { init, increase, decrease, cancel } from "../control";
import { router, routedFactory } from "./router";
import { pouchdbProviderFactory } from "./persist";
import { moduleFactory as napSackFactory } from "../../nap-sack/boundary";
import { moduleFactory as atmFactory } from "../../atm/boundary";

const pouchProvider = pouchdbProviderFactory({ inMemory: true });

export default () => {
  const signals = samFactory({
    accept,
    computeControlState,
    computeNextAction,
    controlState: "normal",
    allowedActions: ["init"], // init required for server-side-rendering
    actions: {
      init, // init is required for server-side-rendering
      increase: ["increase", [increase]], // Example of action-tree.
      decrease,
      cancel,
    },
  });

  const appInit = signals.init;

  const napSack = napSackFactory();
  const atm = atmFactory();

  return {
    init: appInit,
    module: {
      modules: {
        router,
        napSack: addSamState("napSack", napSack.module),
        atm: addSamState("atm", atm.module),
      },
      state: addSamState("", defaultState),
      signals: {
        ...signals,
        rootRouted: routedFactory("root", appInit),
        napSackRouted: routedFactory("napSack", napSack.init, appInit),
        atmRouted: routedFactory("atm", atm.init, appInit),
      },
      catch: new Map([[Error, logError]]),
      providers: [pouchProvider],
    },
  };
};

function logError({ props: { error } }) {
  console.error("App catched an error", error);
}
