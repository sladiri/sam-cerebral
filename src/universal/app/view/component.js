import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import { wrap } from "react-free-style";
import { Style } from "./styles";
import { setFunctionName } from "../../lib/util";
import { views } from "./view";

export const App = setFunctionName(
  "App",
  wrap(
    ({ controlStateName, ...props }) =>
      controlStateName ? views[controlStateName](props) : null,
    Style,
  ),
);

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
