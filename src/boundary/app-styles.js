import Color from "color";
import * as FreeStyle from "free-style";

const Style = FreeStyle.create();

export const blinkAnimation = Style.registerKeyframes({
  to: {
    visibility: "hidden",
  },
});

export const colors = {
  warn: Color("brown").lighten(0.3).string(),
};

export const classNames = {
  warn: Style.registerStyle({
    backgroundColor: colors.warn,
    color: "white",
  }),
  buttonHint: Style.registerStyle({
    color: colors.warn,
    marginLeft: "0.5rem",
    animationName: blinkAnimation,
    animationDuration: "0.1s",
    animationTimingFunction: "steps(5, start)",
    animationIterationCount: "infinite",
  }),
};

const styleElement = document.createElement("style");
styleElement.textContent = Style.getStyles();
document.head.appendChild(styleElement);
