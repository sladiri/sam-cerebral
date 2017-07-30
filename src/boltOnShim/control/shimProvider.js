export default () => {
  let cachedProvider;
  return context => {
    if (!cachedProvider) {
      const { samStep } = context;
      cachedProvider = {
        allDocs(options) {
          return samStep("shim", ["allDocs", options]);
        },
        get(options) {
          return samStep("shim", ["get", options]);
        },
        put(options) {
          return samStep("shim", ["put", options]);
        },
        deleteAll() {
          return samStep("shim", ["deleteAll"]);
        },
      };
    }
    context.db = cachedProvider;
    return context;
  };
};
