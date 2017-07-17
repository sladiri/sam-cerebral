import Router from "@cerebral/router";
import { getRoutedSignalFactory } from "../../sam-step";
import { moduleFactory as blogFactory } from "../../blog/boundary";

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

export default routerWorkAroundNumber => {
  const getRoutedSignal = getRoutedSignalFactory(routerWorkAroundNumber);

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
