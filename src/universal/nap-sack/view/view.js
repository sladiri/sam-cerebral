import h from "react-hyperscript";
import React from "react";
import { wrap } from "react-free-style";

export default wrap(function NapSack({
  model,
  actions,
  actionsDisabled,
  cancelDisabled,
  styles,
}) {
  const activities = model.activities.map(({ name }) =>
    h("li", { key: name }, name),
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
        className={styles.buttonFog}
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
});
