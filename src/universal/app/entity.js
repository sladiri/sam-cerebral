import { wait } from "../util";

export const defaultState = {
  currentPage: null,
  currentPageLoading: false,
  count: 6,
};

export async function accept({ state, props }) {
  const app = state.get();
  const { increment } = props;

  await wait(1200);

  if (Number.isInteger(increment)) {
    const newValue = app.count + increment;
    if (Number.isSafeInteger(newValue)) {
      state.set("count", newValue);
    }
  }
}
