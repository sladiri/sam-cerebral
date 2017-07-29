export default db => {
  const shim = {
    /**
     * A "getter" for (parent) modules.
     * An action must pass some value, noop is a dummy value.
     */
    noop() {
      return { noop: true };
    },

    async init() {
      await db.init;
      return { _hidden: {} };
    },

    async allDocs() {
      const defaultOptions = {
        include_docs: true,
        conflicts: true,
      };
      return {
        docs: await db.local.allDocs(defaultOptions),
      };
    },

    async get({ props: { id } }) {
      const defaultOptions = {
        revs: true,
        revs_info: true,
        conflicts: true,
      };
      return {
        doc: await db.local.get(id, defaultOptions),
      };
    },

    async put({ props: { data } }) {
      if (data.happenedAfter) {
        const previous = await db.local.get(data.happenedAfter);
        data.happenedAfter = previous;
      } else {
        data.happenedAfter = undefined;
      }
      const payload = {
        updated: Date.now(),
        ...data,
      };
      return {
        ...(await db.local.put(payload)),
        ...(await shim.allDocs()),
        ...(await shim.get({ props: { id: payload._id } })),
      };
    },
  };
  return shim;
};
