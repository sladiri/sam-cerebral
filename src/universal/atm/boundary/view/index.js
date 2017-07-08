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
    styles: addButtonStyles(
      props`styles`,
      actionsDisabled("atm"),
      cancelDisabled("atm"),
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
