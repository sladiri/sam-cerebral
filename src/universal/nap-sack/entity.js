import { wait } from "../lib/util";

export const defaultState = {
  activities: [{ name: "foo" }, { name: "bar" }, { name: "baz" }],
};

export async function propose({ state, props: { activities } }) {
  await wait(1000);
  if (activities) state.set("napSack.activities", activities);
}
