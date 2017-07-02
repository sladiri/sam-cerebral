import { wait } from "../util";

export const defaultState = {
  activities: [{ name: "foo" }, { name: "bar" }, { name: "baz" }],
};

export async function accept({ state, props: { activities } }) {
  await wait(1700);
  if (activities) state.set("activities", activities);
}

export function computeControlState(model) {
  const states = [];

  states.push(["normal", ["findJobBrute", "cancel"]]);

  return states;
}

export function computeNextAction(controlState) {}
