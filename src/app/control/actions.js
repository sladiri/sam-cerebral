import { wait } from "../../lib/util";

export async function increase({ value = 1 }) {
  const proposal = await wait(600, { value });
  return proposal;
}

export async function decrease({ value = 1 }) {
  const proposal = await wait(600, { value: value * -1 });
  return proposal;
}

export async function cancel() {
  return await wait(100, {});
}
