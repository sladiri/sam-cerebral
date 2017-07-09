import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const model = compute(get => ({
  activities: get(state`napSack.activities`),
}));
