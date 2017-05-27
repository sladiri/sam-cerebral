import { wait } from "../lib/util";

export function init() {}

const activities = [
  { name: "side-project", time: 10, xp: 20 },
  { name: "algorithms", time: 3, xp: 5 },
  { name: "networking", time: 1, xp: 0.5 },
  { name: "exercise", time: 2, xp: 1.5 },
  { name: "systems design", time: 4, xp: 4 },
  { name: "making CSS codepens", time: 3, xp: 4 },
];

export async function findJobBrute({ time = 1 }) {
  await wait(500);
  return { activities };
}

export async function cancel() {}

export function computeControlState(model) {
  return ["normal", ["findJobBrute", "cancel"]];
}

export function computeNextAction(controlState) {}
