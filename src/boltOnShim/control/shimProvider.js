export default prefix => {
  let cachedProvider;
  return context => {
    if (!cachedProvider) {
      const { samStep } = context;
      cachedProvider = {
        async allDocs(options) {
          const { docs } = await samStep(prefix, ["allDocs", options]);
          return docs;
        },
        async get(options) {
          const { doc } = await samStep(prefix, ["get", options]);
          return doc;
        },
        async getMany(options) {
          const { docsMany } = await samStep(prefix, ["getMany", options]);
          return docsMany;
        },
        put(options) {
          return samStep(prefix, ["put", options]);
        },
        deleteAll() {
          return samStep(prefix, ["deleteAll"]);
        },
      };
    }
    context.db = cachedProvider;
    return context;
  };
};
