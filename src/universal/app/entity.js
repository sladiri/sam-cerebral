import { wait } from "../util";

export const defaultState = {
  currentPage: null,
  count: 6,
  david: {},
};

export async function accept({ state, props, db }) {
  const app = state.get();
  const { increment, david } = props;

  await wait(1200);

  if (Number.isInteger(increment)) {
    const newValue = app.count + increment;
    if (Number.isSafeInteger(newValue)) {
      state.set("count", newValue);
    }
  }

  if (david) {
    state.set("david", david);
  } else {
    // example
    await db.foo();
    state.set("david", await db.local.get("dave@gmail.com"));
  }
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
  let allowNapInterrupt;

  if (controlState === "small") {
    // Example of compound NAP
    nextActions.push(["cancel"]);
    nextActions.push(["increase", { value: 3 }]);
  }

  if (controlState === "big") {
    nextActions.push(["decrease", { value: 2 }]);
    allowNapInterrupt = true; // Example of cancellable NAP.
  }

  return [nextActions, allowNapInterrupt];
}
