import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import { NapSack } from "./view";

export default connect(
  {
    activityNames: state`napSack.activityNames`,
    proposeInProgress: state`napSack.sam.proposeInProgress`,
    acceptAndNapInProgress: state`napSack.sam.acceptAndNapInProgress`,
    napInProgress: state`napSack.sam.napInProgress`,
    findJobBrute: signal`napSack.findJobBrute`,
    cancel: signal`napSack.cancel`,
  },
  (
    {
      activityNames,
      proposeInProgress,
      acceptAndNapInProgress,
      napInProgress,
      findJobBrute,
      cancel,
      ...connectedProps
    },
    parentProps,
  ) => ({
    ...parentProps,
    ...connectedProps,
    model: { activityNames },
    actionsDisabled: proposeInProgress, // Prevent accidental cancellation.
    cancelDisabled: napInProgress || acceptAndNapInProgress, // TODO: Add queuing?
    actions: { findJobBrute, cancel },
  }),
  NapSack,
);
