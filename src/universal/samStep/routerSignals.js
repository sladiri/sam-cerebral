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
export default ({
  routerWorkAroundNumber = null,
  isServerRender = false,
  hasServerState,
}) =>
  function getRoutedSignal({ page, initSignal = [() => {}], rootInitSignal }) {
    let initialisedPages;

    return [
      ({ path, props }) => {
        if (isServerRender) {
          if (
            props.routerWorkAroundNumber === undefined ||
            props.routerWorkAroundNumber === routerWorkAroundNumber
          ) {
            return path.skipAll();
          }

          return path.initialisePage({ page });
        }

        const takePageStateFromServer = do {
          const result = !!initialisedPages && hasServerState;
          initialisedPages = initialisedPages || new Set();
          result;
        };

        const pathKey = do {
          const result =
            takePageStateFromServer || initialisedPages.has(page)
              ? "skipInit"
              : "initialisePage";
          initialisedPages.add(page);
          result;
        };

        const initialiseRoot = do {
          if (
            rootInitSignal &&
            page !== "root" &&
            !initialisedPages.has("root")
          ) {
            initialisedPages.add("root");
            true;
          }
        };

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
            true: [parallel([rootInitSignal || [() => {}], initSignal])],
          },
        ],
      },
    ];
  };
