import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const napSackViewModel = compute(function napSackViewModel(get) {
  return {
    activities: get(state`napSack.activities`),
  };
});
