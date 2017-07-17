import h from "react-hyperscript";
import classNames from "classnames";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";
import { take, last } from "ramda";

import { getModulePath, addDisplayName } from "./util";
import defaults, { colours, getStyles } from "./styles";

import { styled } from "react-free-style";

const withStyle = styled({
  ...defaults,
  samStates: {
    display: "flex",
    fontSize: "0.8rem",
    fontFamily: "monospace",
  },

  stateBlock: {
    backgroundColor: colours.hilightIdle,
    margin: "0.5rem",
    padding: ["0.5rem", "0.3rem"],
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    ">p": { margin: 0 },
  },

  stateActive: {
    backgroundColor: colours.hilight,
    color: "white",
  },
});

export default (prefix, name = "StateIndicator") =>
  connect(
    {
      proposeInProgress: state`${getModulePath(
        prefix,
        "_sam.proposeInProgress",
      )}`,
      acceptInProgress: state`${getModulePath(
        prefix,
        "_sam.acceptInProgress",
      )}`,
      napInProgress: state`${getModulePath(prefix, "_sam.napInProgress")}`,
      syncNap: state`${getModulePath(prefix, "_sam.syncNap")}`,
    },
    withStyle(
      addDisplayName(
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
                      textDecoration:
                        syncNap || !napInProgress ? "none" : "line-through",
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
                  getStyles(styles, ["stateBlock", trigger && "stateActive"]),
                ),
              },
              text,
            ),
          );
          return h("section", { className: styles.samStates }, [
            h("div", [
              h("p", ["SAM-step state", h("br"), ` (${prefix || "root"})`]),
              ...take(2, stateBlocks),
            ]),
            last(stateBlocks),
          ]);
        },
        `${name}${prefix ? `[${prefix}]` : ""}`,
      ),
    ),
  );
