import React from "react";
import classNames from "classnames";
import { styles as Styles } from "./styles";
import samStateIndicator from "../../../sam-state-indicator";
import Increment from "./increment";
import { view as NapSack } from "../../../nap-sack/boundary";
import { view as ATM } from "../../../atm/boundary";
import { view as Blog } from "../../../blog/boundary";

const SamStateIndicator = samStateIndicator();

export const views = {
  normal: ({
    currentPage,
    model: { david },
    actions,
    styles = Styles,
    arrow = () => null,
  }) => {
    let page;

    switch (currentPage) {
      case "root": {
        page = <Increment actions={actions} styles={styles} arrow={arrow} />;
        break;
      }
      case "napSack": {
        page = <NapSack styles={styles} />;
        break;
      }
      case "atm": {
        page = <ATM styles={styles} />;
        break;
      }
      case "blog": {
        page = <Blog styles={styles} />;
        break;
      }
      default: {
        page = <h1>Page Not Found</h1>;
        break;
      }
    }

    return (
      <div className={styles.view}>
        <ul>
          <li>
            <a href="/">root</a>
          </li>
          <li>
            <a href="/napsack">napsack</a>
          </li>
          <li>
            <a href="/atm">atm</a>
          </li>
          <li>
            <a href="/blog">blog</a>
          </li>
        </ul>

        <SamStateIndicator styles={styles} />
        <p>
          root DB: {david._id} {david.age}
        </p>
        {page}

        {/* TODO: Use token value in hidden input field in forms. */}
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
