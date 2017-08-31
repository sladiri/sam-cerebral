import { connect } from "cerebral/react";
import { signal } from "cerebral/tags";

import h from "react-hyperscript";
import React from "react";
import classNames from "classnames";

import { markActionsDisabled } from "../../../samStep/boundary";
import { model } from "../computed";
import { canDelete, canVote } from "../../control/validation";

import { actionFog } from ".";
import ReplyForm from "./ReplyForm";

const voteButtons = ({ vote }, post) => [
  h(
    "button",
    {
      disabled: vote.disabled(post),
      onClick: () => {
        vote({ id: post._id, vote: 1 });
      },
      className: classNames(actionFog(vote, post), "fl"),
    },
    "\u002B",
  ),
  h(
    "button",
    {
      disabled: vote.disabled(post),
      onClick: () => {
        vote({ id: post._id, vote: -1 });
      },
      className: classNames(actionFog(vote, post), "fl"),
    },
    "\u2212",
  ),
];

const DeleteButton = ({ deletePost }, post) =>
  h(
    "button",
    {
      disabled: deletePost.disabled(post),
      onClick: () => {
        deletePost({ id: post._id, deleted: !post.deleted });
      },
      className: classNames(actionFog(deletePost, post), "fl"),
    },
    post.deleted ? "undelete" : "delete",
  );

const ParentMessage = (className, { parentMessage }) =>
  h("span", { className: classNames("db", className) }, [
    '(reply to "',
    h("span", { className: "i" }, parentMessage),
    '")',
  ]);

export default connect(
  {
    model,
    deletePost: signal`blog.deletePost`,
    vote: signal`blog.vote`,
    markActionsDisabled: markActionsDisabled("blog"),
  },
  (
    { model, deletePost, vote, markActionsDisabled, ...connectedProps },
    parentProps,
  ) => ({
    model,
    ...parentProps,
    ...connectedProps,
    actions: {
      ...markActionsDisabled({
        deletePost: do {
          deletePost.isDisabled = post => !canDelete(model.userName, post);
          deletePost;
        },
        vote: do {
          vote.isDisabled = post => !canVote(model.userName, post);
          vote;
        },
      }),
    },
  }),
  function PostsList({ model, actions, className }) {
    return h(
      "ul",
      { className: classNames("pl0", className) },
      model.posts.map(post => {
        const { _id, creator, created, message, deleted, vote } = post;
        return h(
          "li",
          {
            key: _id,
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
              h("span", { className: "fl mr2" }, vote),
              ...voteButtons(actions, post),
              model.userName && DeleteButton(actions, post),
              h(
                "span",
                { className: "fr f7 w-70" },
                `${creator} on ${created}`,
              ),
              post.parentMessage && ParentMessage("f7 tr mv1 fr w-70", post),
            ]),
            h("p", { className: "mv3" }, message),
            model.userName &&
              !post.deleted &&
              <ReplyForm parentId={_id} className="mb2 mt1" />,
          ],
        );
      }),
    );
  },
);
