import React from "react";
import classNames from "classnames";
import { wrap } from "react-free-style";
import { Style } from "./styles";

export default wrap(function Increment({
  model,
  actionsDisabled,
  cancelDisabled,
  actions,
  styles,
  arrow,
}) {
  return (
    <section>

      <button
        disabled={actionsDisabled}
        onClick={() => {
          actions.increase({ value: 10 });
        }}
        className={classNames(styles.increase, styles.buttonFog)}
      >
        {" "}+{" "}
      </button>

      <div>{model.count}{arrow()}</div>

      <button
        disabled={actionsDisabled}
        onClick={() => {
          actions.decrease({ value: 15 });
        }}
        className={classNames(styles.decrease, styles.buttonFog)}
      >
        {" "}-{" "}
      </button>

      <br />
      <button
        disabled={cancelDisabled}
        onClick={() => {
          actions.cancel();
        }}
        className={styles.cancelButtonFog}
      >
        cancel
      </button>

    </section>
  );
}, Style);
