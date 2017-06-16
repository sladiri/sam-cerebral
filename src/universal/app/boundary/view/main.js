import React from "react";
import classNames from "classnames";
import { styles as Styles } from "./styles";
import samStateIndicator from "../../../sam-state-indicator";
import Increment from "./increment";
import { view as NapSack } from "../../../nap-sack/boundary";

const SamStateIndicator = samStateIndicator();

export const views = {
  normal: ({ actions, styles = Styles, arrow = () => null }) => {
    return (
      <div className={styles.view}>
        <SamStateIndicator styles={styles} />
        <Increment actions={actions} styles={styles} arrow={arrow} />
        <NapSack styles={styles} />

        {/* Use token value in hidden input field in forms. */}
        <meta name="csrf-param" content="request_forgery_protection_token" />
        <meta name="csrf-token" content="form_authenticity_token" />
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
