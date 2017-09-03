const init = () => {};
export { init };

const cancel = () => ({ cancel: true });
export { cancel };

const refresh = () => ({ refresh: true });
export { refresh };

const sync = () => ({ sync: true });
export { sync };

const removeAll = () => ({ removeAll: true });
export { removeAll };

const login = ({ props: { userName } }) =>
  (userName || userName === null) && { userName };
export { login };

const logout = () => login({ props: { userName: null } });
export { logout };

const post = ({ props: { message, creator, parentId = null } }) =>
  message && {
    message,
    creator,
    parentId,
  };
export { post };

const deletePost = ({ props: { id, deleted } }) => ({
  id,
  update: { deleted },
});
export { deletePost };

const vote = ({ props: { id, vote } }) => ({
  id,
  update: { vote },
});
export { vote };
