import h from "react-hyperscript";
import React from "react";
import { styled } from "react-free-style";

import defaultCSS from "../../../styles";

const actionFog = (styles, action, ...args) =>
  action.disabled(...args) && styles[".o-40"];

const userForm = ({ model, actions, styles }) =>
  model.userName
    ? <form
        onSubmit={event => {
          event.preventDefault();
          actions.logout();
        }}
      >
        <button
          disabled={actions.logout.disabled()}
          className={actionFog(styles, actions.logout)}
        >
          Logout
        </button>
      </form>
    : <form
        onSubmit={event => {
          event.preventDefault();
          actions.login({
            userName: event.target.getElementsByTagName("input")[0].value,
          });
        }}
      >
        <input disabled={actions.login.disabled()} placeholder="Anton" />

        <br />
        <button
          disabled={actions.login.disabled()}
          className={actionFog(styles, actions.login)}
        >
          Login
        </button>
      </form>;

const postForm = ({ model, actions, styles }) =>
  <form
    onSubmit={event => {
      event.preventDefault();
      actions.post({
        message: event.target.getElementsByTagName("input")[0].value,
      });
      event.target.getElementsByTagName("input")[0].value = "";
    }}
  >
    <input
      disabled={actions.post.disabled(model)}
      placeholder="My two cents ..."
    />

    <br />
    <button
      disabled={actions.post.disabled(model)}
      className={actionFog(styles, actions.post)}
    >
      Post!
    </button>

    <br />
    <button
      disabled={actions.cancel.disabled()}
      type="button"
      onClick={() => {
        actions.cancel();
      }}
      className={actionFog(styles, actions.cancel)}
    >
      Cancel
    </button>
  </form>;

const postsList = ({ model, actions, styles }) =>
  <ul>
    {model.posts.map(post => {
      const { id, creator, created, message, deleted } = post;
      return h("li", { key: id, className: deleted && styles[".strike"] }, [
        h("p", { className: styles[".f6"] }, `${creator} on ${created}:`),
        h("p", message),
        model.userName
          ? h(
              "button",
              {
                disabled: actions.deletePost.disabled(post),
                onClick: () => {
                  actions.deletePost({ id });
                },
                className: actionFog(styles, actions.deletePost, post),
              },
              post.deleted ? "undelete" : "delete",
            )
          : undefined,
      ]);
    })}
  </ul>;

const withStyle = styled(defaultCSS);

export default withStyle(function Blog(props) {
  const { model, SamStateIndicator } = props;

  return (
    <section>
      <SamStateIndicator />

      <p>
        User: {model.userName || "none (log in to post)"}
      </p>

      {userForm(props)}

      <br />

      {postForm(props)}

      {postsList(props)}
    </section>
  );
});
