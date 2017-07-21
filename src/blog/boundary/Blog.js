import h from "react-hyperscript";
import React from "react";
import classNames from "classnames";
import { wrap, ReactFreeStyleContext } from "react-free-style";

import { getCss } from "../../styles/boundary";

const actionFog = (css, action, ...args) =>
  action.disabled(...args) && classNames(css["o-50"], css.strike);

const userForm = ({ model, actions, className, css }) => {
  const formWidthClass = css["w-30"];
  const formClass = classNames(
    className,
    css.flex,
    css["flex-column"],
    css["items-center"],
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
          className={classNames(actionFog(css, actions.logout), formWidthClass)}
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
            actionFog(css, actions.login),
            formWidthClass,
            css.tc,
          )}
          placeholder="Anton"
        />

        <br />
        <button
          disabled={actions.login.disabled()}
          className={classNames(actionFog(css, actions.login), formWidthClass)}
        >
          Login
        </button>
      </form>;
};

const postForm = ({ model, actions, className, css }) => {
  const buttonClass = action => classNames(actionFog(css, action), css.mt2);
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
        className={actionFog(css, actions.post, model)}
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

const postsList = ({ model, actions, css }) =>
  <ul>
    {model.posts.map(post => {
      const { id, creator, created, message, deleted } = post;
      return h(
        "li",
        {
          key: id,
          className: classNames(
            deleted && css.strike,
            css.bt,
            css["b--light-gray"],
            css.bw2,
            css.mt3,
            css.pb2,
          ),
        },
        [
          h(
            "p",
            { className: classNames(css.f6, css.tr) },
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
                  className: actionFog(css, actions.deletePost, post),
                },
                post.deleted ? "undelete" : "delete",
              )
            : undefined,
        ],
      );
    })}
  </ul>;

const Blog = (props, context) => {
  const { model, SamStatus, className } = props;
  const css = getCss(context);

  const formClass = css.mv3;

  return (
    <section className={className}>
      <SamStatus className={classNames(css.mt2, css.mb4)} />

      <p className={css.tc}>
        User: {model.userName || "none (log in to post)"}
      </p>

      {userForm({
        ...props,
        css,
        className: formClass,
      })}

      {postForm({
        ...props,
        css,
        className: formClass,
      })}

      {postsList({ ...props, css })}
    </section>
  );
};
Blog.contextTypes = ReactFreeStyleContext;

export default wrap(Blog);
