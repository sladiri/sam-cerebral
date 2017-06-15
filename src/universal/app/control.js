import { wait } from "../util";

export function init() {}

export async function increase({ props: { value = 1 } }) {
  return await wait(800, { value });
}

export async function decrease({ props: { value = 1 } }) {
  return await wait(800, { value: value * -1 });
}

export async function cancel() {
  return await wait(100, {});
}

export function computeControlState(model) {
  if (Number.isInteger(model.count)) {
    if (model.count < -5) return ["small", ["increase", "cancel"]];

    if (model.count > 5) return ["big", ["decrease", "cancel"]];

    return ["normal", ["increase", "decrease", "cancel"]];
  }
}

export function computeNextAction(controlState) {
  if (controlState === "small") return ["increase", { value: 3 }];
  if (controlState === "big") return ["decrease", {}];
}
