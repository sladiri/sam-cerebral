export default prefix => {
  let cachedProvider;
  return context => {
    if (!cachedProvider) {
      const { samStep } = context;
      cachedProvider = {
        allDocs(options) {
          return samStep(prefix, ["allDocs", options]);
        },
        get(options) {
          return samStep(prefix, ["get", options]);
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
