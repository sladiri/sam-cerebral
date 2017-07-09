import { connect } from "cerebral/react";
import { props, signal } from "cerebral/tags";
import { addButtonStyles } from "../../../computed.js";
import { actionsDisabled, cancelDisabled } from "../../../sam-step";
import { model } from "./computed";
import view from "./view";

export default connect(
  {
    model,
    findJobBrute: signal`napSack.findJobBrute`,
    cancel: signal`napSack.cancel`,
    actionsDisabled: actionsDisabled("napSack"),
    cancelDisabled: cancelDisabled("napSack"),
    styles: addButtonStyles(
      props`styles`,
      actionsDisabled("napSack"),
      cancelDisabled("napSack"),
    ),
  },
  ({ findJobBrute, cancel, ...connectedProps }, parentProps) => {
    return {
      ...parentProps,
      ...connectedProps,
      actions: { findJobBrute, cancel },
    };
  },
  view,
);
