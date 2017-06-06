import h from "react-hyperscript";
import classNames from "classnames";
import { wrap } from "react-free-style";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";

export default connect(
  {
    proposeInProgress: state`sam.proposeInProgress`,
    acceptInProgress: state`sam.acceptInProgress`,
    napInProgress: state`sam.napInProgress`,
  },
  wrap(function StateIndicator({
    proposeInProgress,
    acceptInProgress,
    napInProgress,
    styles,
  }) {
    return h(
      "section",
      [
        [proposeInProgress, "propose (no actions)"],
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
  }),
);
