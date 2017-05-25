export const defaultState = {
  activityNames: [{ name: "foo" }, { name: "bar" }, { name: "baz" }],
};

export const proposeFactory = path =>
  async function propose({ state, props: { activityNames } }) {
    const prefix = path ? `${path}.` : "";
    if (activityNames) state.set(`${prefix}activityNames`, activityNames);
  };
