import h from "react-hyperscript";
import classNames from "classnames";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";
import { take, last } from "ramda";

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
    const stateBlocks = [
      [proposeInProgress, ["propose", h("br"), "(cancelable action)"]],
      [acceptInProgress, ["accept", h("br"), "(no cancel)"]],
      [napInProgress, ["NAP", h("br"), "(no cancel)"]],
    ].map(([trigger, text]) =>
      h(
        "div",
        {
          key: text,
          className: classNames(
            styles.stateBlock,
            trigger && styles.stateActive,
          ),
        },
        text,
      ),
    );
    return h("section", { className: styles.samStates }, [
      h("div", take(2, stateBlocks)),
      last(stateBlocks),
    ]);
  },
);
