import React from "react";
import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";
import color from "color";
import * as FreeStyle from "free-style";

export default connect(
  {
    count: state`count`,
    disabled: state`sam.stepInProgress`,
    controlState: state`sam.controlState.name`,
    increaseClicked: signal`increaseClicked`,
    decreaseClicked: signal`decreaseClicked`,
    cancelClicked: signal`cancelClicked`,
  },
  function App({ controlState, ...props }) {
    return (views[controlState] || views.default)(props);
  },
);

const Style = FreeStyle.create();

const blinkAnimation = Style.registerKeyframes({
  to: {
    visibility: "hidden",
  },
});

const classNames = {
  warn: Style.registerStyle({
    backgroundColor: "brown",
    color: "white",
  }),
  buttonHint: Style.registerStyle({
    marginLeft: "0.5rem",
    animationName: blinkAnimation,
    animationDuration: "0.1s",
    animationTimingFunction: "steps(5, start)",
    animationIterationCount: "infinite",
  }),
};

const styleElement = document.createElement("style");
styleElement.textContent = Style.getStyles();
document.head.appendChild(styleElement);

const views = {
  default({
    count,
    disabled,
    increaseClicked,
    decreaseClicked,
    cancelClicked,
    classNames = {},
    arrow = () => null,
  }) {
    return (
      <div>
        <button
          disabled={disabled}
          onClick={() => increaseClicked({ value: 7 })} // Note: Can propose value without action.
          className={classNames.increase}
        >
          {" "}+{" "}
        </button>
        <div>{count}{arrow()}</div>
        <button
          disabled={disabled}
          onClick={() => decreaseClicked()}
          className={classNames.decrease}
        >
          {" "}-{" "}
        </button>
        <br />
        <br />
        <button onClick={() => cancelClicked()}>cancel</button>
      </div>
    );
  },

  big(props) {
    return views.default({
      ...props,
      classNames: { increase: classNames.warn },
      arrow: () => arrow(false),
    });
  },

  small(props) {
    return views.default({
      ...props,
      classNames: { decrease: classNames.warn },
      arrow: () => arrow(true),
    });
  },
};

function arrow(up) {
  return <span className={classNames.buttonHint}>{up ? "up" : "down"}</span>;
}
