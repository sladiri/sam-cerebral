import React from "react";
import classNames from "classnames";
import { wrap } from "react-free-style";
import { Style, styles as Styles } from "./styles";
import StateIndicator from "./state-indicator";
import Increment from "./increment";
import { NapSack } from "../../nap-sack/boundary";

export const views = {
  normal: wrap(function normal({
    model,
    actions,
    actionsDisabled,
    cancelDisabled,
    styles = Styles,
    arrow = () => null,
  }) {
    styles = {
      ...styles,
      buttonFog: `${actionsDisabled ? ` ${styles.fog}` : ""}`,
      cancelButtonFog: `${cancelDisabled ? ` ${styles.fog}` : ""}`,
    };

    return (
      <div className={styles.view}>

        <StateIndicator model={model} styles={styles} />

        <Increment
          model={model}
          actions={actions}
          styles={styles}
          arrow={arrow}
        />

        <NapSack styles={styles} />

      </div>
    );
  }, Style),

  big(props) {
    return views.normal({
      ...props,
      styles: {
        ...Styles,
        increase: Styles.warn,
      },
      arrow: () => arrow(false),
    });
  },

  small(props) {
    return views.normal({
      ...props,
      styles: {
        ...Styles,
        decrease: Styles.warn,
      },
      arrow: () => arrow(true),
    });
  },
};

function arrow(up) {
  return (
    <span className={classNames(Styles.buttonHint, Styles.attention)}>
      {up ? "too small" : "too big"}
    </span>
  );
}
