import { connect } from "cerebral/react";
import { signal } from "cerebral/tags";

import { markActionsDisabled, cancelDisabled } from "../../../sam-step";
import { model } from "./computed";
import view from "./view";

import samStateIndicatorFactory from "../../../sam-state-indicator";

const SamStateIndicator = samStateIndicatorFactory("blog");

export default connect(
  {
    model,
    login: signal`blog.login`,
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
    cancel.disabled = () => cancelDisabled;
    return {
      model,
      ...parentProps,
      ...connectedProps,
      actions: { ...markActionsDisabled({ login, post, deletePost }), cancel },
      SamStateIndicator,
    };
  },
  view,
);
