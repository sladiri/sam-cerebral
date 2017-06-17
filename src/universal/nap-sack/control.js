import { wait } from "../util";

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
  await wait(1300);
  return { activities: shuffle(activities) };
}

export async function cancel() {}

export function computeControlState(model) {
  const states = [];

  states.push(["normal", ["findJobBrute", "cancel"]]);

  return states;
}

export function computeNextAction(controlState) {}

function shuffle(_array) {
  const array = [..._array];

  for (let i = array.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [array[i - 1], array[j]] = [array[j], array[i - 1]];
  }

  return array;
}
