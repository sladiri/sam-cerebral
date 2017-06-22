import { wait } from "../util";

export function init() {}

export async function insertCard() {
  await wait(500);
}

export function computeControlState(model) {
  const states = [];

  states.push(["start", ["insertCard"]]);

  return states;
}

export function computeNextAction(controlState) {}
