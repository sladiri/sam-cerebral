import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import { views } from "./view";

export const App = ({ controlStateName, ...props }) =>
  controlStateName ? views[controlStateName](props) : null;

export default connect(
  {
    controlStateName: state`sam.controlState.name`,
    increase: signal`increase`,
    decrease: signal`decrease`,
    cancel: signal`cancel`,
  },
  ({ increase, decrease, cancel, ...connectedProps }, parentProps) => ({
    ...parentProps,
    ...connectedProps,
    actions: { increase, decrease, cancel },
  }),
  App,
);
