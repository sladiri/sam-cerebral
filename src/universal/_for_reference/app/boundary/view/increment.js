import React from "react";
import classNames from "classnames";
import { connect } from "cerebral/react";
import { props } from "cerebral/tags";
import { addButtonStyles } from "../../../computed";
import { actionsDisabled, cancelDisabled } from "../../../sam-step.js";
import { appViewModel } from "./computed";

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
            actions.increase({ value: 8 });
          }}
          className={classNames(styles.increase, styles.buttonFog)}
        >
          {" + "}
        </button>

        <div>
          {model.count}
          {arrow()}
        </div>

        <button
          disabled={actionsDisabled}
          onClick={() => {
            actions.decrease({ value: 8 });
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