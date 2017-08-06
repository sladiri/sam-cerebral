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
      <ul className={classNames(css.pl0)}>
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
                css.bw1,
                css.mt2,
                css.mb2,
                css.list,
                css.pt2,
                css.pb1,
                css.pl4,
                css.pr2,
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
                [
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
                          css.fl,
                        ),
                      },
                      post.deleted ? "undelete" : "delete",
                    ),
                  h("span", { className: css.fr }, `${creator} on ${created}`),
                  h("span", { style: { display: "block", clear: "both" } }),
                ],
              ),
              replyTo &&
                h(
                  "p",
                  { className: classNames(css.f6, css.i, css.tr, css.mv1) },
                  `(reply to "${replyTo} ...")`,
                ),
              h("p", { className: classNames(css.mv2) }, message),
              model.userName &&
                !post.deleted &&
                <ReplyForm
                  css={css}
                  replyId={id}
                  className={classNames(css.mb2, css.mt1)}
                />,
            ],
          );
        })}
      </ul>
    );
  },
);
