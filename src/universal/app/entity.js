import { wait } from "../util";

export const defaultState = {
  currentPage: null,
  currentPageLoading: false,
  count: 6,
};

export async function accept({ state, props, db }) {
  await db.foo();
  console.log("entity", await db.local.get("dave@gmail.com").catch(e => e));

  const app = state.get();
  const { increment } = props;

  await wait(1200);

  if (Number.isInteger(increment)) {
    const newValue = app.count + increment;
    if (Number.isSafeInteger(newValue)) {
      state.set("count", newValue);
    }
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
    nextActions.push(["decrease", {}]);
    allowNapInterrupt = true; // Example of cancellable NAP.
  }

  return [nextActions, allowNapInterrupt];
}
