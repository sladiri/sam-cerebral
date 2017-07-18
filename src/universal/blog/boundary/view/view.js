import h from "react-hyperscript";
import React from "react";
import classNames from "classnames";

import withStyle, { getStyles } from "../../../styles";

const actionFog = (styles, action, ...args) =>
  action.disabled(...args) && classNames(styles[".o-50"], styles[".strike"]);

const userForm = ({ model, actions, styles, className }) => {
  const formWidthClass = styles[".w-30"];
  const formClass = classNames(
    className,
    getStyles(styles, [".flex", ".flex-column", ".items-center"]),
  );
  return model.userName
    ? <form
        onSubmit={event => {
          event.preventDefault();
          actions.logout();
        }}
        className={formClass}
      >
        <button
          disabled={actions.logout.disabled()}
          className={classNames(
            actionFog(styles, actions.logout),
            formWidthClass,
          )}
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
        className={formClass}
      >
        <input
          disabled={actions.login.disabled()}
          className={classNames(
            actionFog(styles, actions.login),
            formWidthClass,
            styles[".tc"],
          )}
          placeholder="Anton"
        />

        <br />
        <button
          disabled={actions.login.disabled()}
          className={classNames(
            actionFog(styles, actions.login),
            formWidthClass,
          )}
        >
          Login
        </button>
      </form>;
};

const postForm = ({ model, actions, styles, className }) => {
  const buttonClass = action =>
    classNames(actionFog(styles, action), styles[".mt2"]);
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        actions.post({
          message: event.target.getElementsByTagName("input")[0].value,
        });
        event.target.getElementsByTagName("input")[0].value = "";
      }}
      className={className}
    >
      <input
        disabled={actions.post.disabled(model)}
        className={actionFog(styles, actions.post, model)}
        placeholder="My two cents ..."
      />

      <br />
      <button
        disabled={actions.post.disabled(model)}
        className={buttonClass(actions.post)}
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
        className={buttonClass(actions.cancel)}
      >
        Cancel
      </button>
    </form>
  );
};

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

export default withStyle(function Blog(props) {
  const { model, SamStateIndicator, styles, className } = props;

  const formClass = styles[".mv3"];

  return (
    <section className={className}>
      <SamStateIndicator
        className={classNames(styles[".mt2"], styles[".mb4"])}
      />

      <p className={styles[".tc"]}>
        User: {model.userName || "none (log in to post)"}
      </p>

      {userForm({
        ...props,
        className: formClass,
      })}

      {postForm({
        ...props,
        className: formClass,
      })}

      {postsList(props)}
    </section>
  );
});
