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

export async function post({ props: { message, creator, replyId = null } }) {
  if (!message) return;

  await wait(1500);
  return {
    creator,
    replyId,
    created: Date.now(),
    message,
  };
}

export async function deletePost({ props: { id: deleteId } }) {
  await wait(1500);
  return { deleteId };
}
