import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import { views } from "./view";

export const App = ({ controlStateName, ...props }) =>
  controlStateName ? views[controlStateName](props) : null;

export default connect(
  {
    controlStateName: state`sam.controlState.name`,
    count: state`count`,
    proposeInProgress: state`sam.proposeInProgress`,
    acceptAndNapInProgress: state`sam.acceptAndNapInProgress`,
    napInProgress: state`sam.napInProgress`,
    increase: signal`increase`,
    decrease: signal`decrease`,
    cancel: signal`cancel`,
  },
  (
    {
      count,
      proposeInProgress,
      napInProgress,
      acceptAndNapInProgress,
      increase,
      decrease,
      cancel,
      ...connectedProps
    },
    parentProps,
  ) => ({
    ...parentProps,
    ...connectedProps,
    model: { count },
    actionsDisabled: proposeInProgress, // Prevent accidental cancellation.
    cancelDisabled: napInProgress || acceptAndNapInProgress, // TODO: Add queuing?
    actions: { increase, decrease, cancel },
  }),
  App,
);
