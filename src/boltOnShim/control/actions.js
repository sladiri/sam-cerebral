export default dbPromise => {
  let db;
  const shim = {
    /**
     * A "getter" for (parent) modules.
     * An action must pass some value, noop is a dummy value.
     */
    noop() {
      return { noop: true };
    },

    async init() {
      db = await dbPromise;
      return { _hidden: {} };
    },

    async allDocs() {
      const defaultOptions = {
        include_docs: true,
        conflicts: true,
      };
      return {
        docs: await db.allDocs(defaultOptions),
      };
    },

    async get({ props: { id } }) {
      const defaultOptions = {
        revs: true,
        revs_info: true,
        conflicts: true,
      };
      return {
        doc: await db.get(id, defaultOptions),
      };
    },

    async put({ props: { data } }) {
      const { happenedAfter } = data;
      if (happenedAfter) {
        const id =
          typeof happenedAfter === "string" ? happenedAfter : happenedAfter._id;
        const { doc: previous } = await shim.get({
          props: { id },
        });
        data.happenedAfter = previous;
      } else {
        data.happenedAfter = undefined;
      }
      const payload = {
        updated: Date.now(),
        ...data,
      };
      return {
        ...(await db.put(payload)),
        ...(await shim.allDocs()),
        ...(await shim.get({ props: { id: payload._id } })),
      };
    },

    async deleteAll() {
      const docs = await db.allDocs();
      await Promise.all(docs.rows.map(row => db.remove(row.id, row.value.rev)));
      return {
        ...(await shim.allDocs()),
      };
    },
  };
  return shim;
};
