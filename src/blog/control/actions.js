export async function init() {}

export async function cancel() {
  return { cancel: true };
}

export function refresh() {
  return { refresh: true };
}

export async function login({ props: { userName } }) {
  if (!userName && userName !== null) {
    return;
  }
  return { userName };
}

export async function logout() {
  // example of calling other action.
  return login({ props: { userName: null } });
}

export async function post({ props: { message, creator, parentId = null } }) {
  if (!message) {
    return;
  }
  return {
    message,
    creator,
    parentId,
  };
}

export async function deletePost({ props: { id, deleted } }) {
  return { id, update: { deleted } };
}

export async function vote({ props: { id, vote } }) {
  return { id, update: { vote } };
}
