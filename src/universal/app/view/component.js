import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import { views } from "./view";

export const appView = ({ controlStateName, ...props }) =>
  controlStateName ? views[controlStateName](props) : null;

export const App = connect(
  {
    cancelId: state`sam.stepId`,
    controlStateName: state`sam.controlState.name`,
    count: state`count`,
    proposeInProgress: state`sam.proposeInProgress`,
    acceptAndNapInProgress: state`sam.acceptAndNapInProgress`,
    napInProgress: state`sam.napInProgress`,
    increase: signal`increase`,
    decrease: signal`decrease`,
    cancel: signal`cancel`,
    findJobBrute: signal`findJobBrute`,
  },
  (
    {
      increase,
      decrease,
      cancel,
      count,
      findJobBrute,
      proposeInProgress,
      napInProgress,
      acceptAndNapInProgress,
      ...connectedProps
    },
    parentProps,
  ) => ({
    ...parentProps,
    ...connectedProps,
    actions: { increase, decrease, cancel, findJobBrute },
    model: { count },
    actionsDisabled: proposeInProgress, // TODO: Prevent accidental cancellation?
    cancelDisabled: napInProgress || acceptAndNapInProgress, // TODO: Add queuing?
    proposeInProgress,
    napInProgress,
    acceptAndNapInProgress,
  }),
  appView,
);
