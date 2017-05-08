export function wait(ms, value) {
  return new Promise((resolve, reject) => {
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
