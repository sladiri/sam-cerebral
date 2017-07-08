import Router from "@cerebral/router";
import { parallel } from "cerebral";
import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";

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

/**
 * getRouterFactory
 * 
 * workAroundNumber (server-side rendering only)
 * Requests do not match URL in browser, there seem to be a stray requests.
 * Filter these with "workaroundNumber".
 * TODO: Is this a bug?
 */
export default ({ workAroundNumber } = {}) => {
  const router = Router({ routes });

  const routedSignalFactory = (
    page,
    initSignal = [() => {}],
    rootInitSignal = [() => {}],
  ) => [
    ({ path, props }) => {
      if (isServerRender()) {
        if (
          props.workAroundNumber === undefined ||
          props.workAroundNumber === workAroundNumber
        ) {
          return path.skipAll();
        }

        return path.initialisePage({ page });
      }

      const { stateIsFromServer, initialisedPages } = getPageState();

      const pathKey =
        stateIsFromServer || initialisedPages.has(page)
          ? "skipInit"
          : "initialisePage";

      let initialiseRoot;
      if (page !== "root" && !initialisedPages.has("root")) {
        initialisedPages.add("root");
        initialiseRoot = true;
      }

      initialisedPages.add(page);

      return path[pathKey]({ page, initialiseRoot });
    },
    {
      skipAll: [],
      skipInit: [set(state`currentPage`, page)],
      initialisePage: [
        set(state`currentPage`, props`page`),
        when(props`initialiseRoot`),
        {
          false: [initSignal],
          true: [parallel([rootInitSignal, initSignal])],
        },
      ],
    },
  ];

  return { router, routedSignalFactory };
};

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
