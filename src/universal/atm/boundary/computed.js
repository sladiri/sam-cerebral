import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const atmViewModel = compute(function atmViewModel(get) {
  return {
    money: get(state`atm.entity.money`),
  };
});
