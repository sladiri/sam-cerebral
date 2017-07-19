import { connect } from "cerebral/react";
import { signal } from "cerebral/tags";

import { markActionsDisabled, cancelDisabled } from "../../../samStep/boundary";
import { model } from "./computed";
import view from "./view";

import samStateIndicatorFactory from "../../../SamStateIndicator/boundary";

const SamStateIndicator = samStateIndicatorFactory("blog");

export default connect(
  {
    model,
    login: signal`blog.login`,
    logout: signal`blog.logout`,
    post: signal`blog.post`,
    deletePost: signal`blog.deletePost`,
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
      cancel,
      markActionsDisabled,
      cancelDisabled,
      ...connectedProps
    },
    parentProps,
  ) => {
    post.isDisabled = () => !model.userName;
    deletePost.isDisabled = ({ creator }) => model.userName !== creator;
    cancel.disabled = () => cancelDisabled; // TODO: specify action in progress.
    return {
      model,
      ...parentProps,
      ...connectedProps,
      actions: {
        ...markActionsDisabled({ login, logout, post, deletePost }),
        cancel,
      },
      SamStateIndicator,
    };
  },
  view,
);
