import h from "react-hyperscript";
import classNames from "classnames";
import { wrap } from "react-free-style";
import { Style } from "./styles";

export default wrap(function increment({
  model,
  actionsDisabled,
  cancelDisabled,
  actions,
  styles,
  arrow,
}) {
  return h("section", [
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
    h(
      "button",
      {
        disabled: cancelDisabled,
        onClick() {
          actions.cancel();
        },
        className: styles.cancelButtonFog,
      },
      "cancel",
    ),
  ]);
}, Style);
