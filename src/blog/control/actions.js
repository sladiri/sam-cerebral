import { wait } from "../../util/control";

export async function init() {}

export async function cancel() {
  return { cancel: true };
}

export async function login({ props: { userName } }) {
  if (!userName && userName !== null) return;

  await wait(500);
  return { userName };
}

export async function logout() {
  // example of calling other action.
  return login({ props: { userName: null } });
}

export async function post({ props: { message, creator, parentId = null } }) {
  if (!message) return;

  await wait(1500);
  return {
    creator,
    parentId,
    created: Date.now(),
    message,
  };
}

export async function deletePost({ props: { id: deleteId } }) {
  await wait(1500);
  return { deleteId };
}

export async function clearDb() {
  return { clearDb: true };
}

export function refresh() {
  return { refresh: true };
}
