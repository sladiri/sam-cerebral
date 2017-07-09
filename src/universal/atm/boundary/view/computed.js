import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const model = compute(get => ({
  money: get(state`atm.money`),
}));
