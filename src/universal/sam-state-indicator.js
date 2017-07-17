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
              [
                h("p", { className: styles[".ma0"] }, "propose"),
                h("p", { className: styles[".ma0"] }, "(cancelable action)"),
              ],
            ],
            [
              acceptInProgress,
              [
                h("p", { className: styles[".ma0"] }, "accept"),
                h("p", { className: styles[".ma0"] }, "(no cancel)"),
              ],
            ],
            [
              napInProgress,
              [
                h("p", { className: styles[".ma0"] }, "NAP"),
                h(
                  "p",
                  {
                    className: classNames(
                      getStyles(styles, [
                        (syncNap || !napInProgress) && ".strike",
                        !napInProgress && ".o-50",
                        ".ma0",
                      ]),
                    ),
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
                  getStyles(styles, [
                    trigger ? ".bg-dark-pink" : ".bg-light-pink",
                    trigger && ".white",
                    ".dfl",
                    ".fldir-col",
                    ".fljustify-ctr",
                    ".ma1",
                    ".pv2",
                    ".ph1",
                  ]),
                ),
              },
              text,
            ),
          );
          return h(
            "section",
            {
              className: classNames(
                getStyles(styles, [".f7", ".dfl", "code, .code"]),
              ),
            },
            [
              h("div", [
                h("p", ["SAM-step state", h("br"), ` (${prefix || "root"})`]),
                ...take(2, stateBlocks),
              ]),
              last(stateBlocks),
            ],
          );
        },
        `${name}${prefix ? `[${prefix}]` : ""}`,
      ),
    ),
  );
