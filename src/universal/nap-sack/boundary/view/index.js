import { connect } from "cerebral/react";
import { props, signal } from "cerebral/tags";
import {
  actionsDisabled,
  cancelDisabled,
  addButtonStyles,
} from "../../../computed.js";
import { napSackViewModel } from "../computed";
import view from "./view";

export default connect(
  {
    model: napSackViewModel,
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
