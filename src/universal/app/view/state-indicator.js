import h from "react-hyperscript";
import classNames from "classnames";
import { wrap } from "react-free-style";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";

export default connect(
  {
    proposeInProgress: state`sam.proposeInProgress`,
    acceptAndNapInProgress: state`sam.acceptAndNapInProgress`,
    napInProgress: state`sam.napInProgress`,
  },
  wrap(function StateIndicator({
    proposeInProgress,
    acceptAndNapInProgress,
    napInProgress,
    styles,
  }) {
    return h(
      "section",
      [
        [proposeInProgress, "propose (actions)"],
        [acceptAndNapInProgress, "accept and NAP (cancel)"],
        [napInProgress, "NAP (cancel)"],
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
