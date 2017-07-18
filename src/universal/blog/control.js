import { wait } from "../util";

export async function init() {}

export async function login({ props: { userName } }) {
  if (!userName && userName !== null) return;
  await wait(500);
  return { userName };
}

export async function logout() {
  // example of calling other action.
  return login({ props: { userName: null } });
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

  await wait(1500);
  return {
    created: Date.now(),
    message,
  };
}

export async function deletePost({ props: { id: deleteId } }) {
  await wait(1500);
  return { deleteId };
}

export async function cancel() {
  return { cancel: true };
}
