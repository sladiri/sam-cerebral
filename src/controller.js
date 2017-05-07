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

//////////////////////////////////////////////////////////////////////////////
/// Model
//////////////////////////////////////////////////////////////////

export const defaultState = {
  count: 0,
};

export async function propose({ state, props: { value } }) {
  if (value) state.set("count", state.get("count") + value);
  return await wait(600);
}

//////////////////////////////////////////////////////////////////////////////
/// Control State
//////////////////////////////////////////////////////////////////

export function computeControlState(state) {
  if (Number.isInteger(state.count)) {
    if (state.count <= -2) return "small";

    if (state.count >= 2) return "big";

    return "default";
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
    increaseClicked: samStep(increase),
    decreaseClicked: samStep(decrease),
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
