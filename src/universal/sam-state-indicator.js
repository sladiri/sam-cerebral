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
      syncNap: state`${getModulePath(prefix, "sam.syncNap")}`,
    },
    Object.defineProperty(
      ({
        proposeInProgress,
        acceptInProgress,
        napInProgress,
        syncNap,
        styles,
      }) => {
        const stateBlocks = [
          [
            proposeInProgress,
            [h("p", "propose"), h("p", "(cancelable action)")],
          ],
          [acceptInProgress, [h("p", "accept"), h("p", "(no cancel)")]],
          [
            napInProgress,
            [
              h("p", "NAP"),
              h(
                "p",
                {
                  style: {
                    textDecoration: syncNap || !napInProgress
                      ? "none"
                      : "line-through",
                    opacity: napInProgress ? 1 : 0.5,
                  },
                },
                "(no cancel)",
              ),
            ],
          ],
        ].map(([trigger, text]) =>
          h(
            "div",
            {
              key: text.html,
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
