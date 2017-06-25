import { curry } from "ramda";

export function wait(ms, value) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
}

export function* getId() {
  const maxBits = Number.MAX_SAFE_INTEGER.toString(2).length;

  let value = 0;
  while (true) {
    yield value;
    let temp = (value + 1).toString(2);
    temp = temp.slice(temp.length - maxBits, temp.length);
    value = parseInt(temp, 2);
  }
}

export const getModulePath = curry(
  (prefix, path) =>
    path ? `${`${prefix ? `${prefix}.` : ""}`}${path}` : prefix,
);

// TODO: Copied from Cerebral Controller for UniversalController.
export const getSignal = curry((controller, path) => {
  const pathArray = ensurePath(path);
  const signalKey = pathArray.pop();
  const module = pathArray.reduce((currentModule, key) => {
    return currentModule ? currentModule.modules[key] : undefined;
  }, controller.module);
  const signal = module && module.signals[signalKey];

  if (!signal) {
    throw new Error(`There is no signal at path "${path}"`);
  }

  return signal.signal;
});

function ensurePath(path = []) {
  if (Array.isArray(path)) {
    return path;
  } else if (typeof path === "string") {
    return path.split(".");
  }

  return [];
}
