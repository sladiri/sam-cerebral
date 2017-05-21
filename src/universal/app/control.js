import { wait } from "../lib/util";

export function init() {
  return {};
}

export async function increase({ input: { value = 1 } }) {
  const proposal = await wait(800, { value });
  return proposal;
}

export async function decrease({ input: { value = 1 } }) {
  const proposal = await wait(800, { value: value * -1 });
  return proposal;
}

export async function cancel() {
  return await wait(100, {});
}

export function computeControlState(model) {
  if (Number.isInteger(model.count)) {
    if (model.count < -5)
      return ["small", ["increase", "cancel", "findJobBrute"]];

    if (model.count > 5) return ["big", ["decrease", "cancel", "findJobBrute"]];

    return ["normal", ["increase", "decrease", "cancel", "findJobBrute"]];
  }
}

export function computeNextAction(controlState) {
  // if (controlState === "small") return ["increase", { value: 5 }];
  if (controlState === "big") return ["decrease", {}];
  // return ["tick", {}];
}
