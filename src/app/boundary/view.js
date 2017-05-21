import h from "react-hyperscript";
import classNames from "classnames";
import { styles } from "./styles";

const clicker = fn => () => {
  const time = Number.parseInt(document.getElementById("foo").value);
  console.log({ time }, fn(time));
};

export const views = {
  normal({ model, actions, actionsDisabled, styles = {}, arrow = () => null }) {
    styles.buttonFog = `${actionsDisabled ? ` ${styles.fog}` : ""}`;
    return h("div", [
      h("div", [
        h("input", { id: "foo" }),
        h("br"),
        h(
          "button",
          {
            onClick() {
              clicker(actions.findJobBrute);
            },
          },
          "Calculate Brute",
        ),
      ]),
      h(
        "button",
        {
          disabled: actionsDisabled,
          onClick() {
            actions.increase({ value: 10 });
          },
          className: classNames(styles.increase, styles.buttonFog),
        },
        " + ",
      ),
      h("div", [model.count, arrow()]),
      h(
        "button",
        {
          disabled: actionsDisabled,
          onClick() {
            actions.decrease({ value: 15 });
          },
          className: classNames(styles.decrease, styles.buttonFog),
        },
        " - ",
      ),
      h("br"),
      h("br"),
      h(
        "button",
        {
          onClick() {
            actions.cancel();
          },
        },
        "cancel",
      ),
    ]);
  },

  big(props) {
    return views.normal({
      ...props,
      styles: {
        ...props.styles,
        increase: styles.warn,
      },
      arrow: () => arrow(false),
    });
  },

  small(props) {
    return views.normal({
      ...props,
      styles: {
        ...props.styles,
        decrease: styles.warn,
      },
      arrow: () => arrow(true),
    });
  },
};

function arrow(up) {
  return h(
    "span",
    { className: styles.buttonHint },
    up ? "too small" : "too big",
  );
}
