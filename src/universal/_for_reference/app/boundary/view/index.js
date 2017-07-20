import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import { wrap } from "react-free-style";
import { Style } from "./styles";
import { views } from "./main";
import { appViewModel } from "./computed";

export default connect(
  {
    controlStateName: state`_sam.controlState.name`,
    currentPage: state`currentPage`,
    model: appViewModel,
    increase: signal`increase`,
    decrease: signal`decrease`,
    cancel: signal`cancel`,
  },
  ({ increase, decrease, cancel, ...connectedProps }, parentProps) => ({
    ...parentProps,
    ...connectedProps,
    actions: { increase, decrease, cancel },
  }),
  wrap(function App({ controlStateName, ...props }) {
    return controlStateName ? views[controlStateName](props) : null;
  }, Style),
);