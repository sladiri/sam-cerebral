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
  hilightIdle: Color("magenta").lighten(0.9).string(),
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
    opacity: 0.3,
  }),

  samStates: Style.registerStyle({
    display: "flex",
    fontSize: "0.8rem",
    fontFamily: "monospace",
  }),

  stateBlock: Style.registerStyle({
    backgroundColor: colors.hilightIdle,
    margin: "0.5rem",
    padding: ["0.5rem", "0.3rem"],
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    ">p": { margin: 0 },
  }),

  stateActive: Style.registerStyle({
    backgroundColor: colors.hilight,
    color: "white",
  }),

  view: Style.registerStyle({
    padding: ["1rem", "0.8rem"],

    section: {
      marginBottom: "1rem",
      maxWidth: "20rem",
    },
  }),

  blogMetaInfo: Style.registerStyle({
    fontSize: "70%",
  }),

  blogDeleted: Style.registerStyle({
    textDecoration: "line-through",
  }),
};
