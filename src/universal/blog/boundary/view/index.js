import { connect } from "cerebral/react";
import { signal } from "cerebral/tags";

import { actionsDisabled, cancelDisabled } from "../../../sam-step";
import { model } from "./computed";
import view from "./view";

export default connect(
  {
    model,
    login: signal`blog.login`,
    post: signal`blog.post`,
    deletePost: signal`blog.deletePost`,
    cancel: signal`blog.cancel`,
    actionsDisabled: actionsDisabled("blog"),
    cancelDisabled: cancelDisabled("blog"),
  },
  ({ login, post, deletePost, cancel, ...connectedProps }, parentProps) => {
    return {
      ...parentProps,
      ...connectedProps,
      actions: { login, post, deletePost, cancel },
    };
  },
  view,
);
