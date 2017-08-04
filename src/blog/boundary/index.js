import { connect } from "cerebral/react";
import { signal } from "cerebral/tags";

import { markActionsDisabled, cancelDisabled } from "../../samStep/boundary";
import { model } from "./computed";
import Blog from "./Blog";

import { viewFactory as SamStatusFactory } from "../../samStatus/boundary";

const SamStatus = SamStatusFactory("blog");

export const view = connect(
  {
    model,
    login: signal`blog.login`,
    logout: signal`blog.logout`,
    post: signal`blog.post`,
    deletePost: signal`blog.deletePost`,
    clearDb: signal`blog.clearDb`,
    refresh: signal`blog.refresh`,
    cancel: signal`blog.cancel`,
    markActionsDisabled: markActionsDisabled("blog"),
    cancelDisabled: cancelDisabled("blog"),
  },
  (
    {
      model,
      login,
      logout,
      post,
      deletePost,
      clearDb,
      refresh,
      cancel,
      markActionsDisabled,
      cancelDisabled,
      ...connectedProps
    },
    parentProps,
  ) => {
    post.isDisabled = () => !model.userName;
    deletePost.isDisabled = ({ creator }) =>
      model.userName !== "system" && model.userName !== creator;
    cancel.disabled = () => cancelDisabled; // TODO: specify action in progress.
    return {
      model,
      ...parentProps,
      ...connectedProps,
      actions: {
        ...markActionsDisabled({
          login,
          logout,
          post,
          deletePost,
          clearDb,
          refresh,
        }),
        cancel,
      },
      SamStatus,
    };
  },
  Blog,
);
