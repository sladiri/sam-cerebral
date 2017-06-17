import { wait } from "../util";

export const defaultState = {
  count: 0,
};

export async function accept({ state, props: { increment } }) {
  await wait(1200);
  if (increment) state.set("count", state.get("count") + increment);
}
