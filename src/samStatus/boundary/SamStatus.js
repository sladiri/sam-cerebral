import h from "react-hyperscript";
import classNames from "classnames";
import { take, last } from "ramda";

import { getCss } from "../../styles/boundary";

export default prefix => {
  const view = (
    { proposeInProgress, acceptInProgress, napInProgress, syncNap, className },
    context,
  ) => {
    const css = getCss(context);

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
  };
  return view;
};
