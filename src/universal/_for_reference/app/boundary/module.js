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
import { moduleFactory as blogFactory } from "../../blog/boundary";

import router from "./router";

export default routerWorkAroundNumber => {
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
  const { module: blogModule, init: blogInitSignal } = blogFactory();

  const routedSignalFactory = getRoutedFactory(routerWorkAroundNumber);

  return {
    modules: {
      router,
      napSack: addSamState("napSack", napSackModule),
      atm: addSamState("atm", atmModule),
      blog: addSamState("blog", blogModule),
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
      blogRouted: routedSignalFactory("blog", blogInitSignal, signals.init),
    },
  };
};
