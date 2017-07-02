import { samFactory } from "../../sam-step";
import {
  defaultState,
  accept,
  computeControlState,
  computeNextAction,
} from "../entity";
import { init, increase, decrease, cancel } from "../control";
import { router, routedFactory } from "./router";
import { pouchdbProviderFactory } from "./persist";
import { moduleFactory as napSackFactory } from "../../nap-sack/boundary";
import { moduleFactory as atmFactory } from "../../atm/boundary";
import { napSackInit } from "../../nap-sack/boundary/module";
import { atmInit } from "../../atm/boundary/module";

const samStep = samFactory({
  accept,
  computeControlState,
  computeNextAction,
  controlState: "normal",
  allowedActions: ["init", "rootRouted", "napSackRouted", "atmRouted"], // init required for server-side-rendering
  actions: { init, increase, decrease, cancel },
});

const appInit = [samStep(init)];

export default () => ({
  modules: {
    router,
    napSack: addSamState("napSack", napSackFactory()),
    atm: addSamState("atm", atmFactory()),
  },
  state: addSamState("", defaultState),
  signals: {
    // name: ...stuff outside of SAM, "blocking" SAM stuff,
    init: appInit, // init required for server-side-rendering
    increase: [samStep(["increase", [increase]])], // Example of action-tree.
    decrease: [samStep(decrease)],
    cancel: [samStep(cancel)],
    rootRouted: routedFactory("root", appInit),
    napSackRouted: routedFactory("napSack", napSackInit, appInit),
    atmRouted: routedFactory("atm", atmInit, appInit),
  },
  catch: new Map([[Error, logError]]),
  providers: [pouchdbProviderFactory({ inMemory: true })],
});

function logError({ props: { error } }) {
  console.error("App catched an error", error);
}

function addSamState(_prefix, object) {
  return object.signals
    ? { ...object, state: { ...object.state, _prefix, _sam: {} } }
    : { ...object, _prefix, _sam: {} };
}
