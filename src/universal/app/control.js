import { wait } from "../util";

export function init() {}

export async function increase({ props: { value = 1 } }) {
  return await wait(1500, { increment: value });
}

export async function decrease({ props: { value = 1 } }) {
  return await wait(1500, { increment: value * -1 });
}

export async function cancel() {
  return await wait(100);
}
