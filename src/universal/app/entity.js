import { pouchDbFactory } from "../pouchdb";
import { wait } from "../util";

export const defaultState = {
  currentPage: null,
  count: 8,
  david: {},
};

const pouchOptions = {
  inMemory: true,
  remoteDbHost: "http://localhost:5984",
  remoteDbName: "app-db",
  localDbName: "local_app-db",
};
const db = pouchDbFactory(pouchOptions);

export async function accept({ state, props }) {
  const app = state.get();
  const { increment } = props;

  await wait(1200);

  if (Number.isInteger(increment)) {
    const newValue = app.count + increment;
    if (Number.isSafeInteger(newValue)) {
      state.set("count", newValue);
    }
  }

  // db example
  await db.init;
  await db.foo();

  let david = await db.local.get("dave@gmail.com").catch(e => e);
  console.log("entity", david);
  if (!david.error) {
    state.set("david", david);
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
