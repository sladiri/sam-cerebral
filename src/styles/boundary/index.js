import Color from "color";
import { pick, curry } from "ramda";

import tachyonsStyles from "./tachyonsStyles.json";

export const colours = {
  warn: Color("brown").lighten(0.3).string(),
};

export const getCss = (function() {
  const missingRuleName = "RULE_NOT_FOUND";

  const addedStyles = {
    "flex-grow": {
      "flex-grow": "1",
    },
    [missingRuleName]: {
      "box-shadow": "inset 0px 0px 5px 5px rgba(255,0,255,0.8)",
      border: "3px solid rgba(0,255,255,0.8)",
    },
  };

  const styles = Object.assign(tachyonsStyles, addedStyles);

  const injectCss = ({ registerStyle }) => ({
    get(target, name) {
      name = styles[name] ? name : missingRuleName;
      return name in target
        ? target[name]
        : do {
            const className = registerStyle(styles[name], name);
            target[name] = className;
            className;
          };
    },
  });

  let cachedProxy;

  return ({ freeStyle }) => {
    cachedProxy = cachedProxy || new Proxy({}, injectCss(freeStyle));
    return cachedProxy;
  };
})();

export const getStyles = curry((styles, styleNames) =>
  Object.values(pick(styleNames, styles)),
);
