import { connect } from "cerebral/react";
import { signal } from "cerebral/tags";

import React from "react";
import classNames from "classnames";

import { markActionsDisabled, cancelDisabled } from "../../../samStep/boundary";
import { model } from "../computed";

import { actionFog } from ".";

export default connect(
  {
    model,
    post: signal`blog.post`,
    cancel: signal`blog.cancel`,
    markActionsDisabled: markActionsDisabled("blog"),
    cancelDisabled: cancelDisabled("blog"),
  },
  (
    {
      model,
      post,
      cancel,
      markActionsDisabled,
      cancelDisabled,
      ...connectedProps
    },
    parentProps,
  ) => ({
    ...parentProps,
    ...connectedProps,
    actions: {
      ...markActionsDisabled({
        post: do {
          post.isDisabled = () => !model.userName;
          post;
        },
      }),
      cancel: do {
        // TODO: specify action in progress.
        cancel.disabled = () => cancelDisabled;
        cancel;
      },
    },
  }),
  ({ replyId, actions, className }) => {
    const buttonClass = action => classNames(actionFog(action));
    return (
      <form
        onSubmit={event => {
          event.preventDefault();
          actions.post({
            message: event.target.getElementsByTagName("input")[0].value,
            replyId,
          });
          event.target.getElementsByTagName("input")[0].value = "";
        }}
        className={classNames(className, "flex")}
      >
        <input
          disabled={actions.post.disabled()}
          className={classNames(actionFog(actions.post), "w-10")}
          style={{ flexGrow: 1 }}
          placeholder="Reply here ..."
        />

        <button
          disabled={actions.post.disabled()}
          className={buttonClass(actions.post)}
        >
          Reply!
        </button>

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
  },
);
