import h from "react-hyperscript";
import classNames from "classnames";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";
import { take, last } from "ramda";
import { getModulePath } from "./util";

export default (prefix, name = "StateIndicator") =>
  connect(
    {
      proposeInProgress: state`${getModulePath(
        prefix,
        "sam.proposeInProgress",
      )}`,
      acceptInProgress: state`${getModulePath(prefix, "sam.acceptInProgress")}`,
      napInProgress: state`${getModulePath(prefix, "sam.napInProgress")}`,
    },
    Object.defineProperty(
      ({ proposeInProgress, acceptInProgress, napInProgress, styles }) => {
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
          h("div", [
            h("p", [
              "SAM-step state",
              ...(prefix ? [h("br"), ` (${prefix})`] : []),
            ]),
            ...take(2, stateBlocks),
          ]),
          last(stateBlocks),
        ]);
      },
      "name",
      { value: `${name}${prefix ? `[${prefix}]` : ""}` },
    ),
  );
