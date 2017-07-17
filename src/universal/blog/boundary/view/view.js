import h from "react-hyperscript";
import React from "react";
import { styled } from "react-free-style";

import defaults from "../../../styles";

import samStateIndicatorFactory from "../../../sam-state-indicator";

const withStyle = styled({
  ...defaults,
  blogMetaInfo: {
    fontSize: "70%",
  },
  blogDeleted: {
    textDecoration: "line-through",
  },
});

const SamStateIndicator = samStateIndicatorFactory("blog");

export default withStyle(function Blog({ styles, model, actions }) {
  styles = {
    ...styles,
    actionFog: (action, ...args) => action.disabled(...args) && styles[".o-40"],
  };

  const posts = model.posts.map(post => {
    const { id, creator, created, message, deleted } = post;
    return h("li", { key: id, className: deleted && styles.blogDeleted }, [
      h("p", { className: styles.blogMetaInfo }, `${creator} on ${created}:`),
      h("p", message),
      h(
        "button",
        {
          disabled: actions.deletePost.disabled(post),
          onClick: () => {
            actions.deletePost({ id });
          },
          className: styles.actionFog(actions.deletePost, post),
        },
        post.deleted ? "undelete" : "delete",
      ),
    ]);
  });

  const userPanel = model.userName
    ? <p>
        <button
          disabled={actions.login.disabled()}
          onClick={() => {
            actions.login({});
          }}
          className={styles.actionFog(actions.login)}
        >
          Logout
        </button>
      </p>
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
          className={styles.actionFog(actions.login)}
        >
          Login
        </button>
      </form>;

  return (
    <section>
      <SamStateIndicator />

      <p>
        User: {model.userName || "none (log in to post)"}
      </p>

      {userPanel}

      <br />
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
          className={styles.actionFog(actions.post)}
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
          className={styles.actionFog(actions.cancel)}
        >
          Cancel
        </button>
      </form>

      <ul>
        {posts}
      </ul>
    </section>
  );
});
