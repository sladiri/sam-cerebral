import { state, props } from "cerebral/tags";
import { parallel } from "cerebral";
import { set, when } from "cerebral/operators";

/**
 * getRouterFactory
 * 
 * routerWorkAroundNumber (server-side rendering only)
 * Requests do not match URL in browser, there seem to be a stray requests.
 * Filter these with "workaroundNumber".
 * TODO: Is this a bug?
 */
export default (routerWorkAroundNumber = null) =>
  function getRoutedSignal({
    page,
    initSignal = [() => {}],
    rootInitSignal = [() => {}],
  }) {
    return [
      ({ path, props }) => {
        if (isServerRender()) {
          if (
            props.routerWorkAroundNumber === undefined ||
            props.routerWorkAroundNumber === routerWorkAroundNumber
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

  if (stateIsFromServer) {
    window.stateIsFromServer = true;
  }

  const initialisedPages = (window.CEREBRAL_STATE = stateIsInitialised
    ? window.CEREBRAL_STATE
    : new Set());

  /*eslint-enable no-undef*/

  return { stateIsFromServer, initialisedPages };
}
