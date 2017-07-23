import Router from "@cerebral/router";

import {
  getRoutedSignalFactory,
  SamStepProviderFactory,
} from "../../samStep/boundary";
import { moduleFactory as blogFactory } from "../../blog/control";
import { moduleFactory as shimFactory } from "../../boltOnShim/control";

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

  const shimModule = shimFactory("shim");

  const blogModule = blogFactory(routeMap["/"].prefix);

  return {
    modules: {
      router: Router({ routes }),
      shim: shimModule,
      [routeMap["/"].prefix]: blogModule,
    },
    signals: {
      [routeMap["/"].signalName]: getRoutedSignal({
        page: routeMap["/"].page,
        initSignal: [shimModule.signals.init, blogModule.signals.init],
      }),
    },
    providers: [SamStepProviderFactory()],
  };
};
