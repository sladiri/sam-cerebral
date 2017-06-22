import { connect } from "cerebral/react";
import { props, signal } from "cerebral/tags";
import {
  actionsDisabled,
  cancelDisabled,
  addButtonStyles,
} from "../../../computed.js";
import { atmViewModel } from "../computed";
import view from "./view";

export default connect(
  {
    model: atmViewModel,
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
