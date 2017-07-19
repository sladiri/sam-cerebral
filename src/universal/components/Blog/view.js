import h from "react-hyperscript";
import React from "react";
import classNames from "classnames";

const actionFog = (action, ...args) =>
  action.disabled(...args) && classNames("o-50", "strike");

const userForm = ({ model, actions, className }) => {
  const formWidthClass = "w-30";
  const formClass = classNames(
    className,
    "flex",
    "flex-column",
    "items-center",
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
          className={classNames(actionFog(actions.logout), formWidthClass)}
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
          className={classNames(actionFog(actions.login), formWidthClass, "tc")}
          placeholder="Anton"
        />

        <br />
        <button
          disabled={actions.login.disabled()}
          className={classNames(actionFog(actions.login), formWidthClass)}
        >
          Login
        </button>
      </form>;
};

const postForm = ({ model, actions, className }) => {
  const buttonClass = action => classNames(actionFog(action), "mt2");
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
        className={actionFog(actions.post, model)}
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

const postsList = ({ model, actions }) =>
  <ul>
    {model.posts.map(post => {
      const { id, creator, created, message, deleted } = post;
      return h(
        "li",
        {
          key: id,
          className: classNames(
            deleted && "strike",
            "bt",
            "b--light-gray",
            "bw2",
            "mt3",
            "pb2",
          ),
        },
        [
          h(
            "p",
            { className: classNames("f6", "tr") },
            `${creator} on ${created}`,
          ),
          h("p", message),
          model.userName
            ? h(
                "button",
                {
                  disabled: actions.deletePost.disabled(post),
                  onClick: () => {
                    actions.deletePost({ id });
                  },
                  className: actionFog(actions.deletePost, post),
                },
                post.deleted ? "undelete" : "delete",
              )
            : undefined,
        ],
      );
    })}
  </ul>;

export default function Blog(props) {
  const { model, SamStateIndicator, className } = props;

  const formClass = "mv3";

  return (
    <section className={className}>
      <SamStateIndicator className={classNames("mt2", "mb4")} />

      <p className={"tc"}>
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
}
