import React from "react";
import classNames from "classnames";
import { styles } from "./styles";

export const views = {
  normal({
    count,
    actionsDisabled,
    increase,
    decrease,
    cancel,
    styles = {},
    arrow = () => null,
  }) {
    styles.buttonFog = `${actionsDisabled ? ` ${styles.fog}` : ""}`;
    return (
      <div>
        <button
          disabled={actionsDisabled}
          onClick={() => increase({ value: 7 })} // Note: Can propose value without action.
          className={classNames(styles.increase, styles.buttonFog)}
        >
          {" "}+{" "}
        </button>
        <div>{count}{arrow()}</div>
        <button
          disabled={actionsDisabled}
          onClick={() => decrease()}
          className={classNames(styles.decrease, styles.buttonFog)}
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
    return views.normal({
      ...props,
      styles: {
        ...props.styles,
        increase: styles.warn,
      },
      arrow: () => arrow(false),
    });
  },

  small(props) {
    return views.normal({
      ...props,
      styles: {
        ...props.styles,
        decrease: styles.warn,
      },
      arrow: () => arrow(true),
    });
  },
};

function arrow(up) {
  return <span className={styles.buttonHint}>{up ? "up" : "down"}</span>;
}
