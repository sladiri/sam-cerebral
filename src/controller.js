import Devtools from "cerebral/devtools";
import { Controller } from "cerebral";
import { samStepFactory } from "./sam";

export const actions = {
  async increase({ props: { value } }) {
    const proposal = await wait(600, { value: value || 1 });
    return proposal;
  },

  async decrease({ props: { value } }) {
    const proposal = await wait(600, { value: (value || 1) * -1 });
    return proposal;
  },
};

export async function propose({ state, props: { value } }) {
  if (value) state.set("count", state.get("count") + value);
}

export function computeControlState({ state }) {
  let controlState = null;
  if (Number.isInteger(state.get("count"))) {
    controlState = "default";

    if (state.get("count") <= -2) {
      controlState = "small";
    }

    if (state.get("count") >= 2) {
      controlState = "big";
    }
  }
  state.set("control", controlState);
}

const nextActionMap = {
  small: () => ["increaseClicked", { value: 3 }],
  big: () => ["decreaseClicked", { value: 3 }],
};

const samStep = samStepFactory({
  actions,
  propose,
  computeControlState,
  nextActionMap,
});

export default Controller({
  state: {
    count: 0,
    control: "default",
    block: {
      stepInProgress: false,
      napInProgress: false,
    },
  },
  signals: {
    increaseClicked: samStep(actions.increase),
    decreaseClicked: samStep(actions.decrease),
  },
  catch: new Map([[Error, logError]]),
  devtools: Devtools({ remoteDebugger: "localhost:8585", reconnect: true }),
});

function logError({ props: { error } }) {
  console.error("app catched error", error.stack);
}

function wait(ms, value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
}
