import React from "react";
import { classNames } from "./app-styles";

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

export default function getView(controlState, props) {
  return (views[controlState] || views.default)(props);
}
