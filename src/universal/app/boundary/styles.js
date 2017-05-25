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
  hilight: Color("magenta").darken(0.5).string(),
  hilightIdle: Color("magenta").lighten(0.8).string(),
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
  state: Style.registerStyle({
    backgroundColor: colors.hilightIdle,
    marginBottom: "0.5rem",
  }),
  stateActive: Style.registerStyle({
    backgroundColor: colors.hilight,
    color: "white",
  }),
  view: Style.registerStyle({
    section: {
      marginBottom: "1rem",
    },
  }),
};
