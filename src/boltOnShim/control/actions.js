import { uniqBy } from "ramda";

export default dbPromise => {
  let db;

  const init = async () => {
    db = await dbPromise;
    return await allDocs({}, true);
  };

  const allDocs = async ({ props: { ids } = {} }, doFetch) => {
    if (!doFetch) {
      // Dummy payload, return current state to consumers.
      // Real fetching should be internal according to Bolt-on protocol.
      return { refresh: true };
    }

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

  const get = async ({ props: { id } }) => {
    const defaultOptions = {
      revs: true,
      revs_info: true,
      conflicts: true,
    };
    const doc = await db.get(id, defaultOptions);
    return { doc };
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
    return {
      ...(await db.put(payload)),
      ...(await allDocs({}, true)),
    };
  };

  const deleteAll = async () => {
    const { docs } = await allDocs({}, true);
    await Promise.all(
      docs.rows.map(row => {
        db.remove(row.id, row.value.rev);
      }),
    );
    return await allDocs({}, true);
  };

  return { init, allDocs, get, put, deleteAll };
};
