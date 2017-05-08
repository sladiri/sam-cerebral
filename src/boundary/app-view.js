import React from "react";
import classNames from "classnames";
import { rules } from "./app-styles";

const views = {
  default({
    count,
    disabled,
    increase,
    decrease,
    cancel,
    rules = {},
    arrow = () => null,
  }) {
    return (
      <div>
        <button
          disabled={disabled}
          onClick={() => increase({ value: 7 })} // Note: Can propose value without action.
          className={classNames(rules.increase, rules.buttonFog)}
        >
          {" "}+{" "}
        </button>
        <div>{count}{arrow()}</div>
        <button
          disabled={disabled}
          onClick={() => decrease()}
          className={classNames(rules.decrease, rules.buttonFog)}
        >
          {" "}-{" "}
        </button>
        <br />
        <br />
        <button onClick={() => cancel()}>cancel</button>
      </div>
    );
  },

  big(props) {
    return views.default({
      ...props,
      rules: {
        ...props.rules,
        increase: rules.warn,
      },
      arrow: () => arrow(false),
    });
  },

  small(props) {
    return views.default({
      ...props,
      rules: {
        ...props.rules,
        decrease: rules.warn,
      },
      arrow: () => arrow(true),
    });
  },
};

function arrow(up) {
  return <span className={rules.buttonHint}>{up ? "up" : "down"}</span>;
}

export default function getView(controlState, props) {
  return (views[controlState] || views.default)({
    ...props,
    rules: {
      buttonFog: `${props.disabled ? ` ${rules.fog}` : ""}`,
    },
  });
}
