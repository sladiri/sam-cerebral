import h from "react-hyperscript";
import classNames from "classnames";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";
import { take, last } from "ramda";
import { wrap, ReactFreeStyleContext } from "react-free-style";

import { getModulePath, addDisplayName } from "../util";
import { getCss } from "../styles";

let css;
export default (prefix, name = "SamStateIndicator") => {
  const displayName = `${name}${prefix ? `[${prefix}]` : ""}`;
  const view = addDisplayName(
    (
      {
        proposeInProgress,
        acceptInProgress,
        napInProgress,
        syncNap,
        className,
      },
      context,
    ) => {
      css = css || getCss(context);

      const stateBlocks = [
        [
          proposeInProgress,
          [
            h("p", { className: css.ma0 }, "propose"),
            h("p", { className: css.ma0 }, "(cancelable action)"),
          ],
        ],
        [
          acceptInProgress,
          [
            h("p", { className: css.ma0 }, "accept"),
            h("p", { className: css.ma0 }, "(no cancel)"),
          ],
        ],
        [
          napInProgress,
          [
            h("p", { className: classNames(css.ma0, css.tc) }, "NAP"),
            h(
              "p",
              {
                className: classNames(
                  (syncNap || !napInProgress) && css.strike,
                  !napInProgress && css["o-50"],
                  css.ma0,
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
              trigger ? css["bg-dark-pink"] : css["bg-light-pink"],
              trigger && css.white,
              css.flex,
              css["flex-column"],
              css["justify-center"],
              css.ma1,
              css.pv2,
              css.ph1,
              css["flex-grow"],
            ),
          },
          text,
        ),
      );
      return h(
        "section",
        {
          className: classNames(css.f7, css.flex, css.code, css.tc, className),
        },
        [
          h(
            "div",
            {
              className: classNames(
                css.flex,
                css["flex-column"],
                css["flex-grow"],
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
    displayName,
  );
  view.contextTypes = ReactFreeStyleContext;

  return connect(
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
    wrap(view),
  );
};
