import Color from "color";
import * as ReactFreeStyle from "react-free-style";

export const Style = ReactFreeStyle.create();

const attentionKeyframes = Style.registerKeyframes({
  to: {
    visibility: "hidden",
  },
});

const colors = {
  warn: Color("brown").lighten(0.3).string(),
};

export const styles = {
  warn: Style.registerStyle({
    backgroundColor: colors.warn,
    color: "white",
  }),
  buttonHint: Style.registerStyle({
    marginLeft: "0.5rem",
  }),
  attention: Style.registerStyle({
    color: colors.warn,
    animation: `${attentionKeyframes} 0.1s steps(5, start) infinite`,
  }),

  fog: Style.registerStyle({
    opacity: 0.4,
  }),
};
