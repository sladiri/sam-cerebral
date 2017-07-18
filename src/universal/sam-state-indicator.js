import h from "react-hyperscript";
import classNames from "classnames";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";
import { take, last } from "ramda";

import { getModulePath, addDisplayName } from "./util";
import withStyle, { getStyles } from "./styles";

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
          className,
        }) => {
          const stateBlocks = [
            [
              proposeInProgress,
              [
                h("p", { className: classNames(styles[".ma0"]) }, "propose"),
                h(
                  "p",
                  { className: classNames(styles[".ma0"]) },
                  "(cancelable action)",
                ),
              ],
            ],
            [
              acceptInProgress,
              [
                h("p", { className: classNames(styles[".ma0"]) }, "accept"),
                h(
                  "p",
                  { className: classNames(styles[".ma0"]) },
                  "(no cancel)",
                ),
              ],
            ],
            [
              napInProgress,
              [
                h(
                  "p",
                  { className: classNames(styles[".ma0"], styles[".tc"]) },
                  "NAP",
                ),
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
                    ".flex",
                    ".flex-column",
                    ".justify-center",
                    ".ma1",
                    ".pv2",
                    ".ph1",
                    ".flex-grow",
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
                getStyles(styles, [".f7", ".flex", "code, .code", ".tc"]),
                className,
              ),
            },
            [
              h(
                "div",
                {
                  className: classNames(
                    getStyles(styles, [".flex", ".flex-column", ".flex-grow"]),
                  ),
                },
                [
                  h("p", ["SAM-step state", h("br"), ` (${prefix || "root"})`]),
                  ...take(2, stateBlocks),
                ],
              ),
              last(stateBlocks),
            ],
          );
        },
        `${name}${prefix ? `[${prefix}]` : ""}`,
      ),
    ),
  );
