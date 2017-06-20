import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const appViewModel = compute(function appViewModel(get) {
  return {
    count: get(state`count`),
  };
});
