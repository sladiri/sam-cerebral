import h from "react-hyperscript";
import React from "react";
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
