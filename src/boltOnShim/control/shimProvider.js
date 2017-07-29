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
        post(options) {
          return samStep("shim", ["post", options]);
        },
        put(options) {
          return samStep("shim", ["put", options]);
        },
      };
    }
    context.db = cachedProvider;
    return context;
  };
};
