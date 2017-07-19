import Router from "@cerebral/router";

import { getRoutedSignalFactory } from "../../samStep";
import blogFactory from "../Blog";

export const routeMap = {
  "/": {
    page: "blog",
    prefix: "blog",
    signalName: "blogRouted",
  },
};

const routes = Object.entries(
  routeMap,
).map(([key, { signalName: signal }]) => ({
  path: key,
  signal,
}));

export default (routerOptions = {}) => {
  const getRoutedSignal = getRoutedSignalFactory(routerOptions);

  const blogModule = blogFactory(routeMap["/"].prefix);

  return {
    modules: {
      router: Router({ routes }),
      [routeMap["/"].prefix]: blogModule,
    },
    signals: {
      [routeMap["/"].signalName]: getRoutedSignal({
        page: routeMap["/"].page,
        initSignal: [blogModule.signals.init],
      }),
    },
  };
};
