import h from "react-hyperscript";
import classNames from "classnames";
import { take, last } from "ramda";

export default prefix => {
  const view = ({
    proposeInProgress,
    acceptInProgress,
    napInProgress,
    syncNap,
    className,
  }) => {
    const stateBlocks = [
      [
        proposeInProgress,
        [
          h("p", { className: "ma0" }, "propose"),
          h("p", { className: "ma0" }, "(cancelable action)"),
        ],
      ],
      [
        acceptInProgress,
        [
          h("p", { className: "ma0" }, "accept"),
          h("p", { className: "ma0" }, "(no cancel)"),
        ],
      ],
      [
        napInProgress,
        [
          h("p", { className: classNames("ma0", "tc") }, "NAP"),
          h(
            "p",
            {
              className: classNames(
                (syncNap || !napInProgress) && "strike",
                !napInProgress && "o-50",
                "ma0",
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
            trigger ? "bg-dark-pink" : "bg-light-pink",
            trigger && "white",
            "flex",
            "flex-column",
            "justify-center",
            "ma1",
            "pv2",
            "ph1",
          ),
          style: { flexGrow: 1 },
        },
        text,
      ),
    );
    return h(
      "section",
      {
        className: classNames("f7", "flex", "code", "tc", className),
      },
      [
        h(
          "div",
          {
            className: classNames("flex", "flex-column"),
            style: { flexGrow: 1 },
          },
          [
            h("p", ["SAM-step state", ` (${prefix || "root"})`]),
            ...take(2, stateBlocks),
          ],
        ),
        last(stateBlocks),
      ],
    );
  };
  return view;
};
