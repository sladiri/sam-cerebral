import { samFactory } from "../../samStep/boundary";
import { accept, computeControlState, computeNextAction } from "../entity";
import * as actions from "./actions";

import { moduleFactory as shimFactory } from "../../boltOnShim/control";
import { shimProviderFactory } from "../../boltOnShim/control";

import { getModulePath } from "../../util/control";

export default prefix => {
  const shimPath = "blogDb";
  const shimPrefix = getModulePath(prefix, shimPath);
  const shimModule = shimFactory(shimPrefix);

  const module = {
    ...samFactory({
      prefix,
      accept,
      computeControlState,
      computeNextAction,
      actions,
    }),
    modules: {
      [shimPath]: shimModule,
    },
    provider: shimProviderFactory(shimPrefix),
  };
  module.signals.init = [...shimModule.signals.init, ...module.signals.init];

  return module;
};
