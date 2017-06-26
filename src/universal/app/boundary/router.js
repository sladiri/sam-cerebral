import Router from "@cerebral/router";
import { parallel } from "cerebral";
import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";
import { emitNapDone } from "../../sam-step";

export const routeMap = {
  "/": {
    page: "root",
    module: "",
  },
  "/napsack": {
    page: "napSack",
    module: "napSack",
  },
  "/atm": {
    page: "atm",
    module: "atm",
  },
};

const routes = Object.entries(routeMap).map(([key, val]) => ({
  path: key,
  signal: `${val.page}Routed`,
}));

export const router = Router({ routes });

export const routedFactory = (
  page,
  initSignal = [() => {}],
  rootInitSignal = [() => {}],
) => [
  ({ path }) => {
    // First page is always 'root' on server and has been initialised at this point.
    if (isServerRender()) {
      return path.initialisePage();
    }

    const { stateIsFromServer, initialisedPages } = getPageState();

    const pathKey = stateIsFromServer || initialisedPages.has(page)
      ? "skipInit"
      : "initialisePage";

    let initialiseRoot;
    if (page !== "root" && !initialisedPages.has("root")) {
      initialisedPages.add("root");
      initialiseRoot = true;
    }

    initialisedPages.add(page);

    return path[pathKey]({ initialiseRoot });
  },
  {
    skipInit: [set(state`currentPage`, page)],
    initialisePage: [
      set(state`currentPageLoading`, true),
      set(state`currentPage`, page),
      when(props`initialiseRoot`),
      {
        false: [initSignal],
        true: [parallel([rootInitSignal, initSignal])],
      },
      set(state`currentPageLoading`, false),
      emitNapDone("router"),
    ],
  },
];

function isServerRender() {
  /*eslint-disable no-undef*/
  return typeof window === "undefined";
  /*eslint-enable no-undef*/
}

function getPageState() {
  /*eslint-disable no-undef*/

  const stateIsInitialised = window.CEREBRAL_STATE instanceof Set;

  const stateIsFromServer =
    !stateIsInitialised && window.CEREBRAL_STATE instanceof Object;

  const initialisedPages = (window.CEREBRAL_STATE = stateIsInitialised
    ? window.CEREBRAL_STATE
    : new Set());

  /*eslint-enable no-undef*/

  return { stateIsFromServer, initialisedPages };
}
