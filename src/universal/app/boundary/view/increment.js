import React from "react";
import classNames from "classnames";
import { compute } from "cerebral";
import { connect } from "cerebral/react";
import { props, state } from "cerebral/tags";
import {
  actionsDisabled,
  cancelDisabled,
  addButtonStyles,
} from "../../../computed";

const appViewModel = compute(function appViewModel(get) {
  return {
    count: get(state`count`),
  };
});

export default connect(
  {
    model: appViewModel,
    actionsDisabled: actionsDisabled(),
    cancelDisabled: cancelDisabled(),
    styles: addButtonStyles(props`styles`, actionsDisabled(), cancelDisabled()),
  },
  function Increment({
    model,
    actions,
    actionsDisabled,
    cancelDisabled,
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
          {" + "}
        </button>

        <div>{model.count}{arrow()}</div>

        <button
          disabled={actionsDisabled}
          onClick={() => {
            actions.decrease({ value: 15 });
          }}
          className={classNames(styles.decrease, styles.buttonFog)}
        >
          {" - "}
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
  },
);
