import { wait } from "../lib/util";

export const defaultState = {
  count: 0,
};

export async function propose({ state, props: { value } }) {
  await wait(400);
  if (value) state.set("count", state.get("count") + value);
}

export function computeControlState(state) {
  if (Number.isInteger(state.count)) {
    if (state.count <= -2) return ["small", ["increase", "cancel"]];

    if (state.count >= 2) return ["big", ["decrease", "cancel"]];

    return ["normal", ["increase", "decrease", "cancel"]];
  }
}

export function computeNextAction(controlState) {
  if (controlState === "small") return ["increase", { value: 6 }];

  if (controlState === "big") return ["decrease", { value: 3 }];
}
