import Color from "color";

import tachyonsJson from "./tachyons.json";

const getCss = (acc, [key, val]) => {
  if (val.children && Object.keys(val.children).length) {
    acc[key] = Object.entries(val.children).reduce(getCss, {});
    return acc;
  } else if (val.attributes) {
    acc[key] = val.attributes;
    return acc;
  } else {
    return acc;
  }
};

export const colours = {
  app: Color("green").lighten(2.7).string(),
  warn: Color("brown").lighten(0.3).string(),
  hilight: Color("magenta").darken(0.5).string(),
  hilightIdle: Color("magenta").lighten(0.9).string(),
};

const { tachyonsStyles } = Object.entries({
  tachyonsStyles: tachyonsJson,
}).reduce(getCss, {});

export default {
  ...tachyonsStyles,
  fog: {
    opacity: 0.3,
  },
};
