import React from "react";
import { connect } from "cerebral/react";
import { state, signal } from "cerebral/tags";

export default connect(
  {
    count: state`count`,
    disabled: state`sam.stepInProgress`,
    view: state`view`,
    increaseClicked: signal`increaseClicked`,
    decreaseClicked: signal`decreaseClicked`,
  },
  function App({ view, ...props }) {
    return getView(view)(props);
  },
);

const views = {
  styles: {
    warn: { color: "red" },
  },
  default({ count, disabled, increaseClicked, decreaseClicked, styles = {} }) {
    if (styles.warn) console.log("sty", styles.warn);
    return (
      <div>
        <button
          disabled={disabled}
          onClick={() => increaseClicked({ value: 7 })} // Note: Can propose value without action.
          style={styles.increase}
        >
          {" "}+{" "}
        </button>
        <div>{count}</div>
        <button disabled={disabled} onClick={() => decreaseClicked()}>
          {" "}-{" "}
        </button>
      </div>
    );
  },
  big(props) {
    return this.default(Object.assign(props, { increase: this.styles.warn }));
  },
};

function getView(view) {
  return views[view] || views.default;
}
