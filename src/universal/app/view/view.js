import React from "react";
import classNames from "classnames";
import { styles as Styles } from "./styles";
import StateIndicator from "./state-indicator";
import Increment from "./increment";
import { component as NapSack } from "../../nap-sack/boundary";

export const views = {
  normal: ({ actions, styles = Styles, arrow = () => null }) => {
    return (
      <div className={styles.view}>
        <StateIndicator styles={styles} />
        <Increment actions={actions} styles={styles} arrow={arrow} />
        <NapSack styles={styles} />
      </div>
    );
  },

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
