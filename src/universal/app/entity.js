import { wait } from "../util";

export const defaultState = {
  count: 6,
};

export async function accept({ state, props: { value } }) {
  await wait(1200);
  if (value) state.set("count", state.get("count") + value);
}
