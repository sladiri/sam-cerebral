import { wait } from "../lib/util";

export const defaultState = {
  count: 0,
};

export async function propose({ state, props: { value } }) {
  await wait(1200);
  if (value) state.set("count", state.get("count") + value);
}
