import { wait } from "../lib/util";

export const defaultState = {
  activityNames: [{ name: "foo" }, { name: "bar" }, { name: "baz" }],
};

export const proposeFactory = path =>
  async function propose({ state, props: { activityNames } }) {
    await wait(1000);
    const prefix = path ? `${path}.` : "";
    if (activityNames) state.set(`${prefix}activityNames`, activityNames);
  };
