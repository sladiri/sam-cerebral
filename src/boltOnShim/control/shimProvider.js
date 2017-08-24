export default prefix => {
  let cachedProvider;
  return context => {
    if (!cachedProvider) {
      const { samStep } = context;
      cachedProvider = {
        async put(options) {
          const { docs } = await samStep(prefix, ["put", options]);
          return { rows: docs.rows.filter(r => r.id === options.data._id) };
        },
        async getAll(ids) {
          const { docs } = await samStep(prefix, ["getAll"]);
          return Array.isArray(ids)
            ? { rows: docs.rows.filter(r => ids.includes(r.id)) }
            : docs;
        },
        async removeAll() {
          const { docs } = await samStep(prefix, ["removeAll"]);
          return docs;
        },
      };
    }
    context.db = cachedProvider;
    return context;
  };
};
