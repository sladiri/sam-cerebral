import h from "react-hyperscript";
import classNames from "classnames";
import { wrap } from "react-free-style";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";
import { Style } from "./styles";

export default connect(
  {
    proposeInProgress: state`sam.proposeInProgress`,
    acceptAndNapInProgress: state`sam.acceptAndNapInProgress`,
    napInProgress: state`sam.napInProgress`,
  },
  wrap(function stateIndicator({
    proposeInProgress,
    acceptAndNapInProgress,
    napInProgress,
    styles,
  }) {
    return h("section", [
      h(
        "div",
        {
          className: classNames(
            styles.state,
            proposeInProgress && styles.stateActive,
          ),
        },
        "propose (actions)",
      ),
      h(
        "div",
        {
          className: classNames(
            styles.state,
            acceptAndNapInProgress && styles.stateActive,
          ),
        },
        "accept and NAP (cancel)",
      ),
      h(
        "div",
        {
          className: classNames(
            styles.state,
            napInProgress && styles.stateActive,
          ),
        },
        "NAP (cancel)",
      ),
    ]);
  }, Style),
);
