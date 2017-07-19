import { styled } from "react-free-style";
import Color from "color";
import { pick, curry } from "ramda";

import cssParserJson from "./tachyonsParsedNoUndef.json";

const splitRulePerSelector = ({ selectors, declarations }, checkNonClasses) => {
  const rules = {};
  for (const selector of selectors) {
    if (!selector.startsWith(".")) {
      if (checkNonClasses)
        throw new Error(
          "Parser not implemented for media query",
          selectors,
          selector,
        );
      continue;
    }

    const key = selector.substr(1);
    rules[key] = declarations;
  }
  return rules;
};

const splitMediaqueryPerRule = val => {
  if (val.value.length !== 1) throw new Error("unexpected media value", val);

  const rules = {};
  const mediaKey = `${val.type} ${val.value[0]}`;
  const mediaRules = val.nestedRules.map(splitRulePerSelector, true);
  for (const nestedRules of mediaRules) {
    for (const [key, value] of Object.entries(nestedRules)) {
      rules[key] = {
        [mediaKey]: value,
      };
    }
  }
  return rules;
};

const parseJson = (acc, val) => {
  if (val.type === "rule") {
    Object.assign(acc, splitRulePerSelector(val));
  } else if (val.type === "@media") {
    Object.assign(acc, splitMediaqueryPerRule(val));
  } else {
    throw new Error("Parsing not implemented for val", val);
  }
  return acc;
};

const tachyonsStyles = cssParserJson.value.reduce(parseJson, {});

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
