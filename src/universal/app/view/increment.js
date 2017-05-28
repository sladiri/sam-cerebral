import React from "react";
import classNames from "classnames";
import { wrap } from "react-free-style";
import { connect } from "cerebral/react";
import { state, props, signal } from "cerebral/tags";
import { Style } from "./styles";
import {
  appModel,
  actionsDisabled,
  cancelDisabled,
  addButtonStyles,
} from "../../lib/computed";

export default connect(
  {
    model: appModel,
    actionsDisabled: actionsDisabled(state`sam.proposeInProgress`),
    cancelDisabled: cancelDisabled(
      state`sam.acceptAndNapInProgress`,
      state`sam.napInProgress`,
    ),
    styles: addButtonStyles(
      props`styles`,
      actionsDisabled(state`sam.proposeInProgress`),
      cancelDisabled(
        state`sam.acceptAndNapInProgress`,
        state`sam.napInProgress`,
      ),
    ),
  },
  wrap(function Increment({
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
  }, Style),
);
