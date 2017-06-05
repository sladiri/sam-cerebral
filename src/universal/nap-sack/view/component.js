import { connect } from "cerebral/react";
import { props, signal } from "cerebral/tags";
import {
  napSackViewModel,
  actionsDisabled,
  cancelDisabled,
  addButtonStyles,
} from "../../lib/computed.js";
import NapSack from "./view";

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
  ({ findJobBrute, cancel, ...connectedProps }, parentProps) => ({
    ...parentProps,
    ...connectedProps,
    actions: { findJobBrute, cancel },
  }),
  NapSack,
);
