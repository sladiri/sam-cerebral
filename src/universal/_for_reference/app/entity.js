import { pouchDbFactory } from "../pouchdb";
import { wait } from "../util";

export const defaultState = {
  currentPage: null,
  count: 0,
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
  await db.init;
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
  let david = await ensureDavid(db.local);
  // console.log("david ready", david);
  david = await db.local.put({ ...david, age: david.age + 1 });
  // console.log("david put", david);

  david = await db.local.get("dave@gmail.com").catch(e => e);
  // console.log("entity", david);
  if (!david.error) {
    state.set("david", david);
  }
}

async function ensureDavid(db) {
  const _id = "dave@gmail.com";
  let response;

  response = await db.get(_id).catch(e => e);
  if (!response.error) {
    return response.retrieved ? response : { ...response, retrieved: true };
  }

  const david = {
    _id,
    name: "David",
    age: 69,
    ran: `${Math.random()}`,
  };
  response = await db.put(david).then(o => ({ _rev: o.rev })).catch(e => e);
  if (!response.error) {
    return response.created
      ? { ...response, ...david }
      : { ...response, ...david, created: true };
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
