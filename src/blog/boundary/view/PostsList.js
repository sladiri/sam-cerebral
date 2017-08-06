import { connect } from "cerebral/react";
import { signal } from "cerebral/tags";

import h from "react-hyperscript";
import React from "react";
import classNames from "classnames";

import { markActionsDisabled } from "../../../samStep/boundary";
import { model } from "../computed";

import { actionFog } from ".";
import ReplyForm from "./ReplyForm";

export default connect(
  {
    model,
    deletePost: signal`blog.deletePost`,
    markActionsDisabled: markActionsDisabled("blog"),
  },
  (
    { model, deletePost, markActionsDisabled, ...connectedProps },
    parentProps,
  ) => ({
    model,
    ...parentProps,
    ...connectedProps,
    actions: {
      ...markActionsDisabled({
        deletePost: do {
          deletePost.isDisabled = ({ creator }) =>
            model.userName !== "system" && model.userName !== creator;
          deletePost;
        },
      }),
    },
  }),
  function PostsList({ model, actions, css }) {
    return (
      <ul className={classNames(css.pa3, css.pl4)}>
        {model.posts.map(post => {
          const { id, creator, created, message, deleted, replyTo } = post;
          return h(
            "li",
            {
              key: id,
              className: classNames(
                deleted && css.strike,
                css.bt,
                css["b--light-gray"],
                css.bw2,
                css.mt2,
                css.mb2,
                css.list,
              ),
            },
            [
              h(
                "p",
                {
                  className: classNames(
                    css.f6,
                    css.tr,
                    css.mt2,
                    css.mb1,
                    css.code,
                  ),
                },
                `${creator} on ${created}`,
              ),
              replyTo &&
                h(
                  "p",
                  { className: classNames(css.f6, css.i, css.tr, css.mv1) },
                  `(reply to "${replyTo} ...")`,
                ),
              h("p", { className: classNames(css.mt2, css.mb3) }, message),
              model.userName &&
                h(
                  "button",
                  {
                    disabled: actions.deletePost.disabled(post),
                    onClick: () => {
                      actions.deletePost({ id });
                    },
                    className: classNames(
                      actionFog(css, actions.deletePost, post),
                      css.mb2,
                    ),
                  },
                  post.deleted ? "undelete" : "delete",
                ),
              model.userName &&
                !post.deleted &&
                <ReplyForm css={css} replyId={id} />,
            ],
          );
        })}
      </ul>
    );
  },
);
