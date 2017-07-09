import { wait } from "../util";

export async function init() {}

export async function login({ props: { userName } }) {
  return { userName: userName || "" };
}

export async function post({ props: { creator, message } }) {
  if ((creator && creator !== "system") || !message) return;

  await wait(500);
  return {
    creator,
    created: Date.now(),
    message,
  };
}

export async function deletePost({ props: { id } }) {
  return { id, deleted: true };
}

export async function cancel() {
  return { cancel: true };
}
