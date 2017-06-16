import { wait } from "../util";

export const defaultState = {
  activities: [{ name: "foo" }, { name: "bar" }, { name: "baz" }],
};

export async function accept({ state, props: { activities } }) {
  await wait(1700);
  if (activities) state.set("napSack.activities", activities);
}
