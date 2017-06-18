import { wait } from "../util";

export function init() {}

export async function increase({ props: { value = 1 } }) {
  return await wait(800, { increment: value });
}

export async function decrease({ props: { value = 1 } }) {
  return await wait(800, { increment: value * -1 });
}

export async function cancel() {
  return await wait(100, {});
}

export function computeControlState(model) {
  const states = [];

  if (Number.isInteger(model.count)) {
    if (model.count < -5) states.push(["small", ["increase", "cancel"]]);
    else if (model.count > 5) states.push(["big", ["decrease", "cancel"]]);
    else states.push(["normal", ["increase", "decrease", "cancel"]]);
  }

  return states;
}

export function computeNextAction(controlState) {
  const nextActions = [];

  if (controlState === "small") {
    // Example of compound NAP
    nextActions.push(["cancel"]);
    nextActions.push(["increase", { value: 3 }]);
  }

  if (controlState === "big") nextActions.push(["decrease", {}]);

  return nextActions;
}
