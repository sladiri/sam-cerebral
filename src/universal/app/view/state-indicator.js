import h from "react-hyperscript";
import classNames from "classnames";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";

export default connect(
  {
    proposeInProgress: state`sam.proposeInProgress`,
    acceptInProgress: state`sam.acceptInProgress`,
    napInProgress: state`sam.napInProgress`,
  },
  function StateIndicator({
    proposeInProgress,
    acceptInProgress,
    napInProgress,
    styles,
  }) {
    return h(
      "section",
      [
        [proposeInProgress, "propose (cancelable action)"],
        [acceptInProgress, "accept (no cancel)"],
        [napInProgress, "NAP (no cancel)"],
      ].map(([trigger, text]) =>
        h(
          "div",
          {
            key: text,
            className: classNames(styles.state, trigger && styles.stateActive),
          },
          text,
        ),
      ),
    );
  },
);
