import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import { wrap } from "react-free-style";
import { Style } from "./styles";
import { views } from "./main";

export default connect(
  {
    controlStateName: state`_sam.controlState.name`,
    currentPage: state`currentPage`,
    currentPageLoading: state`currentPageLoading`,
    david: state`david`,
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
