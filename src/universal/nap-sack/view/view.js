import h from "react-hyperscript";
import React from "react";
import classNames from "classnames";
import { wrap } from "react-free-style";
import { Style } from "../../app/view/styles";

export const NapSack = wrap(function NapSack({
  model,
  actions,
  actionsDisabled,
  cancelDisabled,
  styles,
}) {
  styles = {
    ...styles,
    buttonFog: `${actionsDisabled ? ` ${styles.fog}` : ""}`,
    cancelButtonFog: `${cancelDisabled ? ` ${styles.fog}` : ""}`,
  };

  const activities = model.activityNames.map(activity =>
    h("li", { key: activity.name }, activity.name),
  );

  return (
    <section>

      <input
        id="foo"
        onChange={e => {
          // TODO: Write to state?
          console.log("on change event", e.nativeEvent.target.value);
        }}
      />

      <br />
      <button
        disabled={actionsDisabled}
        onClick={() => {
          actions.findJobBrute({
            time: document.getElementById("foo").value,
          });
        }}
        className={classNames(styles.increase, styles.buttonFog)}
      >
        Calculate Brute
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

      <ul>{activities}</ul>

    </section>
  );
}, Style);
