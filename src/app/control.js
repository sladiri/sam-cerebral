import { wait } from "../lib/util";

export async function increase({ value = 1 }) {
  const proposal = await wait(600, { value });
  return proposal;
}

export async function decrease({ value = 1 }) {
  const proposal = await wait(600, { value: value * -1 });
  return proposal;
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
  // if (controlState === "small") return ["increase", { value: 5 }];
  // if (controlState === "big") return ["decrease", {}];
  // return ["tick", {}];
}
