import h from "react-hyperscript";
import classNames from "classnames";
import { wrap } from "react-free-style";
import { Style, styles as Styles } from "./styles";

export const views = {
  normal: wrap(function normal({
    model,
    actions,
    actionsDisabled,
    cancelDisabled,
    styles = Styles,
    arrow = () => null,
    proposeInProgress,
    acceptAndNapInProgress,
    napInProgress,
  }) {
    styles.buttonFog = `${actionsDisabled ? ` ${styles.fog}` : ""}`;
    styles.cancelButtonFog = `${cancelDisabled ? ` ${styles.fog}` : ""}`;
    return h("div", { className: styles.view }, [
      h("section", [
        h(
          "div",
          {
            className: classNames(
              styles.state,
              proposeInProgress && styles.stateActive,
            ),
          },
          "propose (actions)",
        ),
        h(
          "div",
          {
            className: classNames(
              styles.state,
              acceptAndNapInProgress && styles.stateActive,
            ),
          },
          "accept and NAP (cancel)",
        ),
        h(
          "div",
          {
            className: classNames(
              styles.state,
              napInProgress && styles.stateActive,
            ),
          },
          "NAP (cancel)",
        ),
      ]),
      h("section", [
        h("input", {
          id: "foo",
          onChange(e) {
            console.log("eeee", e.nativeEvent.target.value);
          },
        }),
        h("br"),
        h(
          "button",
          {
            onClick() {
              console.log("eeee 2", document.getElementById("foo").value);
              actions.findJobBrute({
                time: document.getElementById("foo").value,
              });
            },
          },
          "Calculate Brute",
        ),
      ]),
      h("section", [
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
        h("div", [
          model.count,
          actionsDisabled
            ? h("span", { className: styles.buttonHint }, "Actions disabled!")
            : undefined,
          cancelDisabled
            ? h("span", { className: styles.buttonHint }, "Cancel disabled!")
            : undefined,
          arrow(),
        ]),
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
      ]),
    ]);
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
  return h(
    "span",
    { className: classNames(Styles.buttonHint, Styles.attention) },
    up ? "too small" : "too big",
  );
}
