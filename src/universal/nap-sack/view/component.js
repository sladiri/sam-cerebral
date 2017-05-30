import { connect } from "cerebral/react";
import { state, signal, props } from "cerebral/tags";
import { NapSack } from "./view";
import {
  actionsDisabled,
  cancelDisabled,
  addButtonStyles,
} from "../../lib/computed";
import { styles } from "../../app/view/styles";

export default connect(
  {
    activities: state`activities`,
    findJobBrute: signal`findJobBrute`,
    cancel: signal`cancel`,
    actionsDisabled: actionsDisabled(),
    cancelDisabled: cancelDisabled(),
    styles: addButtonStyles(styles, actionsDisabled(), cancelDisabled()),
  },
  ({ activities, findJobBrute, cancel, ...connectedProps }, parentProps) => ({
    ...parentProps,
    ...connectedProps,
    model: { activities },
    actions: { findJobBrute, cancel },
  }),
  NapSack,
);
