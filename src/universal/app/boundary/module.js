import { samFactory, addSamState, getRoutedFactory } from "../../sam-step";

import {
  defaultState,
  accept,
  computeControlState,
  computeNextAction,
} from "../entity";
import { init, increase, decrease, cancel } from "../control";

import { moduleFactory as napSackFactory } from "../../nap-sack/boundary";
import { moduleFactory as atmFactory } from "../../atm/boundary";

import router from "./router";

export default workAroundNumber => {
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

  const { module: napSackModule, init: napSackInitSignal } = napSackFactory();
  const { module: atmModule, init: atmInitSignal } = atmFactory();

  const routedSignalFactory = getRoutedFactory({
    workAroundNumber,
  });

  return {
    modules: {
      router,
      napSack: addSamState("napSack", napSackModule),
      atm: addSamState("atm", atmModule),
    },
    state: addSamState("", defaultState),
    signals: {
      ...signals,
      rootRouted: routedSignalFactory("root", signals.init),
      napSackRouted: routedSignalFactory(
        "napSack",
        napSackInitSignal,
        signals.init,
      ),
      atmRouted: routedSignalFactory("atm", atmInitSignal, signals.init),
    },
    catch: new Map([[Error, logError]]),
  };
};

function logError({ props: { error } }) {
  console.error("App catched an error", error);
}
