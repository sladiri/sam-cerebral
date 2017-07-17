import { wait } from "../util";

export async function init() {}

export async function login({ props: { userName } }) {
  await wait(500);
  return { userName: userName || "" };
}

export async function postSystem({ props: { message } }) {
  await wait(200);
  return {
    creator: "system",
    created: Date.now(),
    message,
  };
}

export async function post({ props: { message } }) {
  if (!message) return;

  await wait(2000);
  return {
    created: Date.now(),
    message,
  };
}

export async function deletePost({ props: { id: deleteId } }) {
  return { deleteId };
}

export async function cancel() {
  return { cancel: true };
}
