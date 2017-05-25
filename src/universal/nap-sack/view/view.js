import h from "react-hyperscript";
import { wrap } from "react-free-style";
import { Style } from "../../app/view/styles";

export const NapSack = wrap(function NapSack({
  model,
  actions,
  actionsDisabled,
  cancelDisabled,
  styles,
}) {
  const activities = model.activityNames.map((activity, i) =>
    h("li", { key: `${i}-${activity.name}` }, activity.name),
  );

  return h("section", [
    h("input", {
      id: "foo",
      onChange(e) {
        // TODO: Write to state?
        console.log("on change event", e.nativeEvent.target.value);
      },
    }),
    h("br"),
    h(
      "button",
      {
        disabled: actionsDisabled,
        onClick() {
          actions.findJobBrute({
            time: document.getElementById("foo").value,
          });
        },
      },
      "Calculate Brute",
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
    h("ul", activities),
  ]);
}, Style);
