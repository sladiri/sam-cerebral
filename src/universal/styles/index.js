import { styled } from "react-free-style";
import Color from "color";
import { pick, curry } from "ramda";

import tachyonsStyles from "./parseJson";

export const colours = {
  warn: Color("brown").lighten(0.3).string(),
};

const addedStyles = {
  "flex-grow": {
    "flex-grow": "1",
  },
};

export const withStyle = styled(Object.assign(tachyonsStyles, addedStyles));

export const getStyles = curry((styles, styleNames) =>
  Object.values(pick(styleNames, styles)),
);
