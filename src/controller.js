import Devtools from "cerebral/devtools";
import { Controller } from "cerebral";
import { samStepFactory } from "./sam";

//////////////////////////////////////////////////////////////////////////////
/// Actions
//////////////////////////////////////////////////////////////////

export async function increase({ value = 1 }) {
  const proposal = await wait(600, { value });
  return proposal;
}

export async function decrease({ value = 1 }) {
  const proposal = await wait(600, { value: value * -1 });
  return proposal;
}

export async function cancel() {
  return await wait(100, {});
}

//////////////////////////////////////////////////////////////////////////////
/// Model
//////////////////////////////////////////////////////////////////

export const defaultState = {
  count: 0,
};

export async function propose({ state, props: { value } }) {
  await wait(400);
  if (value) state.set("count", state.get("count") + value);
}

//////////////////////////////////////////////////////////////////////////////
/// Control State
//////////////////////////////////////////////////////////////////

export function computeControlState(state) {
  if (Number.isInteger(state.count)) {
    if (state.count <= -2) return ["small", ["increaseClicked", "cancel"]];

    if (state.count >= 2) return ["big", ["decreaseClicked", "cancel"]];

    return ["default", ["increaseClicked", "decreaseClicked", "cancel"]];
  }
}

export function computeNextAction(controlState) {
  if (controlState === "small") return ["increaseClicked", { value: 6 }];

  if (controlState === "big") return ["decreaseClicked", { value: 3 }];
}

//////////////////////////////////////////////////////////////////////////////
/// SAM Container
//////////////////////////////////////////////////////////////////

const samStep = samStepFactory({
  propose,
  computeControlState,
  computeNextAction,
});

export default Controller({
  state: defaultState,
  signals: {
    init: samStep(() => {}),
    increaseClicked: samStep(increase),
    decreaseClicked: samStep(decrease),
    cancelClicked: samStep(cancel),
  },
  catch: new Map([[Error, logError]]),
  devtools: Devtools({ remoteDebugger: "localhost:8585", reconnect: true }),
});

function logError({ props: { error } }) {
  console.error("app catched error", error);
}

function wait(ms, value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
}
