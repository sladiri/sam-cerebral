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
    actionsDisabled: state`sam.proposeInProgress`,
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
    cancelDisabled: napInProgress || acceptAndNapInProgress,
    napInProgress,
    acceptAndNapInProgress,
  }),
  appView,
);
