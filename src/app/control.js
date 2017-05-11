import { wait } from "../lib/util";

export const actions = {
  async increase({ value = 1 }) {
    const proposal = await wait(600, { value });
    return proposal;
  },

  async decrease({ value = 1 }) {
    const proposal = await wait(600, { value: value * -1 });
    return proposal;
  },

  async cancel() {
    return await wait(100, {});
  },
};

export function computeControlState(model) {
  if (Number.isInteger(model.count)) {
    if (model.count <= -2) return ["small", ["increase", "cancel"]];

    if (model.count >= 2) return ["big", ["decrease", "cancel"]];

    return ["normal", ["increase", "decrease", "cancel"]];
  }
}

export function computeNextAction(controlState) {
  if (controlState === "small") return ["increase", { value: 5 }];

  if (controlState === "big") return ["decrease", {}];
}
