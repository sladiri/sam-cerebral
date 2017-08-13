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
        async put(options) {
          const { doc } = await samStep(prefix, ["put", options]);
          return doc;
        },
        async deleteAll() {
          const { docs } = await samStep(prefix, ["deleteAll"]);
          return docs;
        },
      };
    }
    context.db = cachedProvider;
    return context;
  };
};
