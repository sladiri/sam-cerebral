import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import { views } from "./view";

export const App = connect(
  {
    controlStateName: state`sam.controlState.name`,
    count: state`count`,
    actionsDisabled: state`sam.stepInProgress`,
    increase: signal`increase`,
    decrease: signal`decrease`,
    cancel: signal`cancel`,
  },
  function computeAppViewModel(
    { increase, decrease, cancel, count, ...connectedProps },
    parentProps,
  ) {
    return {
      ...parentProps,
      ...connectedProps,
      actions: { increase, decrease, cancel },
      model: { count },
    };
  },
  ({ controlStateName, ...props }) =>
    controlStateName ? views[controlStateName](props) : null,
);
