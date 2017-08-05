/* eslint-env node */

import jsonfile from "jsonfile";
import path from "path";

import tachyonsCssJson from "./tachyonsCss.json";

const splitRulePerSelector = ({ selectors, declarations }, preventTagRules) => {
  const rules = {};
  for (const selector of selectors) {
    if (!selector.startsWith(".")) {
      if (preventTagRules)
        throw new Error(
          "Parsing not implemented for tag rule.",
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

const splitMediaqueryPerRule = ({ value, type, nestedRules }) => {
  if (value.length !== 1)
    throw new Error("Parsing not implemented for media rule", value);

  const rules = {};
  const mediaKey = `${type} ${value[0]}`;
  const mediaRules = nestedRules.map(splitRulePerSelector, true);
  for (const nestedRules of mediaRules) {
    for (const [key, value] of Object.entries(nestedRules)) {
      rules[key] = {
        [mediaKey]: value,
      };
    }
  }
  return rules;
};

const parseJson = (acc, value) => {
  if (value.type === "rule") {
    Object.assign(acc, splitRulePerSelector(value));
  } else if (value.type === "@media") {
    Object.assign(acc, splitMediaqueryPerRule(value));
  } else {
    throw new Error("Parsing not implemented for JSON value", value);
  }
  return acc;
};

jsonfile.writeFileSync(
  path.join(__dirname, "tachyonsStyles.json"),
  tachyonsCssJson.value.reduce(parseJson, {}),
  { spaces: 2 },
);
