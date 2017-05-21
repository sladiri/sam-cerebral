import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import { views } from "./view";

export function computeAppViewModel(
  { increase, decrease, cancel, count, ...connectedProps },
  parentProps,
) {
  return {
    ...parentProps,
    ...connectedProps,
    actions: { increase, decrease, cancel },
    model: { count },
  };
}

export const appView = ({ controlStateName, ...props }) =>
  controlStateName ? views[controlStateName](props) : null;

export const App = connect(
  {
    controlStateName: state`sam.controlState.name`,
    count: state`count`,
    actionsDisabled: state`sam.stepInProgress`,
    increase: signal`increase`,
    decrease: signal`decrease`,
    cancel: signal`cancel`,
  },
  computeAppViewModel,
  appView,
);
