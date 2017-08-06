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
  function PostsList({ model, actions, className }) {
    return (
      <ul className={classNames("pl0", className)}>
        {model.posts.map(post => {
          const { id, creator, created, message, deleted, replyTo } = post;
          return h(
            "li",
            {
              key: id,
              className: classNames(
                deleted && "strike",
                "bt",
                "b--light-gray",
                "bw1",
                "list",
                "pt2",
                "pb1",
                "pl4",
                "pr2",
              ),
            },
            [
              h("p", { className: "f6 tr mt2 mb1 code cf" }, [
                model.userName &&
                  h(
                    "button",
                    {
                      disabled: actions.deletePost.disabled(post),
                      onClick: () => {
                        actions.deletePost({ id });
                      },
                      className: classNames(
                        actionFog(actions.deletePost, post),
                        "fl",
                      ),
                    },
                    post.deleted ? "undelete" : "delete",
                  ),
                h("span", { className: "fr f7" }, `${creator} on ${created}`),
              ]),
              replyTo &&
                h("p", { className: "f6 tr mv1" }, [
                  '(reply to "',
                  h("span", { className: "i" }, replyTo),
                  '")',
                ]),
              h("p", { className: "mv3" }, message),
              model.userName &&
                !post.deleted &&
                <ReplyForm replyId={id} className="mb2 mt1" />,
            ],
          );
        })}
      </ul>
    );
  },
);
