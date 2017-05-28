import { connect } from "cerebral/react";
import { state, signal, props } from "cerebral/tags";
import { NapSack } from "./view";
import {
  actionsDisabled,
  cancelDisabled,
  addButtonStyles,
} from "../../lib/computed";

export default connect(
  {
    activities: state`napSack.activities`,
    findJobBrute: signal`napSack.findJobBrute`,
    cancel: signal`napSack.cancel`,
    actionsDisabled: actionsDisabled(state`napSack.sam.proposeInProgress`),
    cancelDisabled: cancelDisabled(
      state`napSack.sam.acceptAndNapInProgress`,
      state`napSack.sam.napInProgress`,
    ),
    styles: addButtonStyles(
      props`styles`,
      actionsDisabled(state`napSack.sam.proposeInProgress`),
      cancelDisabled(
        state`napSack.sam.acceptAndNapInProgress`,
        state`napSack.sam.napInProgress`,
      ),
    ),
  },
  ({ activities, findJobBrute, cancel, ...connectedProps }, parentProps) => ({
    ...parentProps,
    ...connectedProps,
    model: { activities },
    actions: { findJobBrute, cancel },
  }),
  NapSack,
);
