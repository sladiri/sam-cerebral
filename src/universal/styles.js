import { styled } from "react-free-style";
import Color from "color";
import { pick } from "ramda";

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
  warn: Color("brown").lighten(0.3).string(),
};

export const getStyles = (styles, styleNames) =>
  Object.values(pick(styleNames, styles));

const { tachyonsStyles } = Object.entries({
  tachyonsStyles: tachyonsJson,
}).reduce(getCss, {});

const addedStyles = {
  ".flex-grow": {
    "flex-grow": "1",
  },
};

export default styled(Object.assign(tachyonsStyles, addedStyles));
