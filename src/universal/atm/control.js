import { wait } from "../util";

export function init() {}

export async function abort() {
  return { abort: true };
}

export async function card({ props: { value = false } }) {
  return { card: value };
}

export async function pin({ props: { value = 1234 } }) {
  return { pin: value };
}

export async function changeBalance({ props: { value = 0 } }) {
  return { moneyIncrement: value };
}

export function computeControlState(model) {
  const states = [];

  if (!model.card) {
    states.push(["getCard", ["card"]]);
  } else if (!model.pin) {
    states.push(["getPin", ["pin"]]);
  } else if (model.card && model.pin) {
    states.push(["getAmount", ["changeBalance"]]);
  }

  return states;
}

export function computeNextAction(controlState) {}
