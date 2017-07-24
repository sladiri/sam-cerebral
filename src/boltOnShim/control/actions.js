import { pickAll } from "ramda";

export default db => {
  const shim = {
    async init() {
      await db.init;
      return { _hidden: {} };
    },

    async allDocs() {
      return {
        docs: await db.local.allDocs({ include_docs: true }),
      };
    },

    async get({ props: { id } }) {
      return {
        doc: await db.local.get(id),
      };
    },

    async post({ props: { data } }) {
      if (data.happenedAfter) {
        const previous = await db.local.get(data.happenedAfter);
        data.happenedAfter = pickAll(["updated", "_rev", "_id"], previous);
      } else {
        data.happenedAfter = undefined;
      }
      const payload = {
        updated: Date.now(),
        ...data,
      };
      return {
        ...(await db.local.post(payload)),
        ...(await shim.allDocs()),
      };
    },

    async put({ props: { data } }) {
      const payload = {
        updated: Date.now(),
        ...data,
      };
      return {
        ...(await db.local.put(payload)),
        ...(await shim.allDocs()),
      };
    },
  };
  return shim;
};