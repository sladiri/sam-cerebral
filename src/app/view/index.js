import React from "react";
import classNames from "classnames";
import { styles } from "./styles";

export const views = {
  normal({ model, actions, actionsDisabled, styles = {}, arrow = () => null }) {
    styles.buttonFog = `${actionsDisabled ? ` ${styles.fog}` : ""}`;
    return (
      <div>
        <button
          disabled={actionsDisabled}
          onClick={() => actions.increase({ value: 10 })} // Note: Can propose value without action.
          className={classNames(styles.increase, styles.buttonFog)}
        >
          {" "}+{" "}
        </button>
        <div>{model.count}{arrow()}</div>
        <button
          disabled={actionsDisabled}
          onClick={() => actions.decrease({ value: 15 })}
          className={classNames(styles.decrease, styles.buttonFog)}
        >
          {" "}-{" "}
        </button>
        <br />
        <br />
        <button onClick={() => actions.cancel()}>cancel</button>
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
  return (
    <span className={styles.buttonHint}>{up ? "too small" : "too big"}</span>
  );
}
