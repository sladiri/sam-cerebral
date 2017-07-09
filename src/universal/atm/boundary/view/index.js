import { connect } from "cerebral/react";
import { props } from "cerebral/tags";
import { addButtonStyles } from "../../../computed.js";
import { actionsDisabled, cancelDisabled } from "../../../sam-step.js";
import { model } from "./computed";
import view from "./view";

export default connect(
  {
    model,
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
