const o = { a: 42 };
const p = { b: 666 };
({ ...o, ...p, c: 123 });

async function* gfn() {
  const promises = [123, 42, 666];
  while (promises.length) {
    yield await Promise.resolve(promises[0]);
    promises.splice(0, 1);
  }
}

(async function() {
  for await (const x of gfn()) {
    console.log("awaiting", x);
  }
})();
