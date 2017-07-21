import Router from "@cerebral/router";

import { getRoutedSignalFactory } from "../samStep/boundary";
import { moduleFactory as blogFactory } from "../blog/control";

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

export const moduleFactory = (routerOptions = {}) => {
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
