import { uniqBy } from "ramda";

// const get = async ({ props: { id } }) => {
//   const defaultOptions = {
//     revs: true,
//     revs_info: true,
//     conflicts: true,
//   };
//   const doc = await db.get(id, defaultOptions);
//   return { doc };
// };

// const remove = async ({ props: { id, rev } }) => {
//   const response = await db.remove(id, rev);
//   console.log("remove response", response);
//   return await _allDocs();
// };

export default dbPromise => {
  let db;

  const init = async () => {
    db = await dbPromise;
    return await _allDocs();
  };

  const _allDocs = async ids => {
    const options = {
      include_docs: true,
      conflicts: true,
    };
    if (ids) options.keys = ids;
    const docs = await db.allDocs(options);
    const withConflichts = docs.rows.filter(d => !!d.doc._conflicts);
    if (withConflichts.length) {
      console.warn("conflicts in documents", withConflichts);
      debugger;
    }
    return { docs };
  };

  const put = async ({ props: { data } }) => {
    const { inResponseTo } = data;
    let previous;
    if (inResponseTo.length === 1) {
      previous = inResponseTo[0];
    }
    if (previous) {
      data.inResponseTo.push(previous);
      data.inResponseTo = uniqBy(x => x, data.inResponseTo);
    }
    const payload = {
      updated: Date.now(),
      ...data,
    };
    const response = await db.put(payload);
    if (!response.ok) {
      console.warn("put response not ok", response);
      debugger;
    }
    return await _allDocs();
  };

  const getAll = async () => {
    // Dummy payload, return current state to consumers.
    // Real fetching should be internal according to Bolt-on protocol.
    return { refresh: true };
  };

  const removeAll = async () => {
    const { docs } = await _allDocs();
    const responses = await Promise.all(
      docs.rows.map(row => db.remove(row.id, row.value.rev)),
    );
    const notOk = responses.filter(r => !r.ok);
    if (notOk.length) {
      console.warn("removeAll responses not ok", responses);
      debugger;
    }
    return await _allDocs();
  };

  return { init, put, getAll, removeAll };
};
