import { connect } from "cerebral/react";
import { props, signal } from "cerebral/tags";
import { addButtonStyles } from "../../../computed.js";
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
    styles: addButtonStyles(
      props`styles`,
      actionsDisabled("blog"),
      cancelDisabled("blog"),
    ),
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
