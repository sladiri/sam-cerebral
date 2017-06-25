import { wait } from "../util";

export function init() {}

export async function abort() {
  return { abort: true };
}

export async function card({ props: { value = false } }) {
  return { card: value };
}

export async function pin({ props: { value = 1234 } }) {
  return { pin: value };
}

export async function changeBalance({ props: { value = 0 } }) {
  return { moneyIncrement: value };
}
