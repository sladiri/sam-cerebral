import { styled } from "react-free-style";
import Color from "color";
import { pick } from "ramda";

import cssParserJson from "./tachyonsParsed.json";

const parseJson = (acc, val) => {
  if (val.type === "rule") {
    const key = val.selectors.join(",");
    const value = val.declarations;
    acc[key] = value;
  } else if (val.type === "@media") {
    if (val.value.length !== 1) throw new Error("unexpected media value", val);
    const key = `${val.type} ${val.value[0]}`;
    const value = val.nestedRules.reduce(parseJson, {});
    acc[key] = value;
  } else {
    throw new Error("nope val", val);
  }
  return acc;
};

const tachyonsStyles = cssParserJson.value.reduce(parseJson, {});

export const colours = {
  warn: Color("brown").lighten(0.3).string(),
};

const addedStyles = {
  ".flex-grow": {
    "flex-grow": "1",
  },
};

export default styled(Object.assign(tachyonsStyles, addedStyles));

export const getStyles = (styles, styleNames) =>
  Object.values(pick(styleNames, styles));
