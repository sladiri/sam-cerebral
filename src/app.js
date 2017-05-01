import React from "react";
import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";

export default connect(
  {
    count: state`count`,
    disabled: state`sam.stepInProgress`,
    controlState: state`sam.controlState`,
    increaseClicked: signal`increaseClicked`,
    decreaseClicked: signal`decreaseClicked`,
  },
  function App({ controlState, ...props }) {
    return (views[controlState] || views.default)(props);
  },
);

const styles = {
  warn: { backgroundColor: "brown" },
  buttonHint: { marginLeft: "0.5rem" },
};

const views = {
  default({
    count,
    disabled,
    increaseClicked,
    decreaseClicked,
    styles = {},
    arrow = () => null,
  }) {
    return (
      <div>
        <button
          disabled={disabled}
          onClick={() => increaseClicked({ value: 7 })} // Note: Can propose value without action.
          style={styles.increase}
        >
          {" "}+{" "}
        </button>
        {arrow()}
        <div>{count}</div>
        <button
          disabled={disabled}
          onClick={() => decreaseClicked()}
          style={styles.decrease}
        >
          {" "}-{" "}
        </button>
      </div>
    );
  },

  big(props) {
    return views.default({
      ...props,
      styles: { increase: styles.warn },
      arrow: () => arrow(false),
    });
  },

  small(props) {
    return views.default({
      ...props,
      styles: { decrease: styles.warn },
      arrow: () => arrow(true),
    });
  },
};

function arrow(up) {
  return <span style={styles.buttonHint}>{up ? "up" : "down"}</span>;
}
