import { parallel } from "cerebral";
import { set } from "cerebral/operators";
import { state } from "cerebral/tags";
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
import router from "./router";
import { module as napSack } from "../../nap-sack/boundary";
import { module as atm } from "../../atm/boundary";
import { napSackInit } from "../../nap-sack/boundary/module";
import { atmInit } from "../../atm/boundary/module";

const samStep = samStepFactory({
  accept,
  computeControlState,
  computeNextAction,
  controlState: "normal",
  allowedActions: ["init", "rootRouted", "napSackRouted", "atmRouted"], // init required for server-side-rendering
  actions: { init, increase, decrease, cancel },
});

const initFactory = (page, initSignal, rootInitSignal = []) => [
  ({ path }) => {
    /*eslint-disable no-undef*/
    const stateIsInitialised = window.CEREBRAL_STATE instanceof Set;
    const stateIsFromServer =
      !stateIsInitialised && window.CEREBRAL_STATE instanceof Object;
    const initialisedPages = (window.CEREBRAL_STATE = stateIsInitialised
      ? window.CEREBRAL_STATE
      : new Set());
    /*eslint-enable no-undef*/

    const pathKey = stateIsFromServer || initialisedPages.has(page)
      ? "skipInit"
      : "initialisePage";

    let initialiseRoot;
    if (page !== "root" && !initialisedPages.has("root")) {
      initialisedPages.add("root");
      initialiseRoot = true;
    }

    initialisedPages.add(page);

    return path[pathKey]({ initialisedPages, initialiseRoot });
  },
  {
    skipInit: [set(state`currentPage`, page)],
    initialisePage: [
      set(state`currentPageLoading`, true),
      set(state`currentPage`, page),
      ({ path, props: { initialisedPages, initialiseRoot } }) => {
        const pathKey = initialiseRoot
          ? do {
              initialisedPages.add("root");
              ("initWithRoot");
            }
          : "init";
        return path[pathKey]();
      },
      {
        initWithRoot: parallel([rootInitSignal, initSignal]),
        init: [initSignal],
      },
      set(state`currentPageLoading`, false),
    ],
  },
];

const appInit = samStep(init);

export default {
  modules: {
    router,
    napSack,
    atm,
  },
  state: defaultState,
  signals: {
    // name: ...stuff outside of SAM, "blocking" SAM stuff,
    init: appInit, // init required for server-side-rendering
    increase: samStep(["increase", [increase]]), // Example of action-tree.
    decrease: samStep(decrease),
    cancel: samStep(cancel),
    rootRouted: initFactory("root", appInit.signal),
    napSackRouted: initFactory("napSack", napSackInit.signal, appInit.signal),
    atmRouted: initFactory("atm", atmInit.signal, appInit.signal),
  },
  catch: new Map([[Error, logError]]),
  // Add a global provider when module instantiates
  // provider(context, functionDetails, payload) {},
};

function logError({ props: { error } }) {
  console.error("App catched an error", error);
}
