import { samFactory, addSamState, getRoutedFactory } from "../../sam-step";
import {
  defaultState,
  accept,
  computeControlState,
  computeNextAction,
} from "../entity";
import { init, increase, decrease, cancel } from "../control";
import { routes } from "./router";
import { moduleFactory as napSackFactory } from "../../nap-sack/boundary";
import { moduleFactory as atmFactory } from "../../atm/boundary";

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

  const appInitSignal = signals.init;

  const { module: napSackModule, init: napSackInitSignal } = napSackFactory();
  const { module: atmModule, init: atmInitSignal } = atmFactory();

  const { router, routedSignalFactory } = getRoutedFactory({
    workAroundNumber,
    routes,
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
      rootRouted: routedSignalFactory("root", appInitSignal),
      napSackRouted: routedSignalFactory(
        "napSack",
        napSackInitSignal,
        appInitSignal,
      ),
      atmRouted: routedSignalFactory("atm", atmInitSignal, appInitSignal),
    },
    catch: new Map([[Error, logError]]),
  };
};

function logError({ props: { error } }) {
  console.error("App catched an error", error);
}
