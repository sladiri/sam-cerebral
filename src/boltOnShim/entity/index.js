export default dbPromise => {
  let db;
  return {
    async accept({ state, props }) {
      const shim = state.get();

      if (!db) {
        db = await dbPromise;
      }

      if (!shim._hidden) {
        state.set("_hidden", {});
      }

      state.unset("doc");
      state.unset("ok");
      state.unset("id");
      state.unset("rev");

      {
        const { docs } = props;
        if (docs) {
          // TODO: filter causal cut
          state.set("docs", docs);
        }
      }

      {
        const { doc } = props;
        if (doc) {
          // TODO: filter causal cut
          state.set("doc", doc);
        }
      }

      {
        const { ok } = props;
        if (ok !== undefined) {
          state.set("ok", ok);
        }
      }

      {
        const { id } = props;
        if (id) {
          state.set("id", id);
        }
      }

      {
        const { rev } = props;
        if (rev) {
          state.set("rev", rev);
        }
      }
    },

    computeControlState(m) {
      // if (m.x < 5) {
      //   return [["low", ["foo"]]];
      // }

      return [["normal", ["allDocs", "get", "post", "put", "deleteAll"]]];
    },

    computeNextAction(controlState) {
      // if (controlState === "low") {
      //   return [[["foo"]]];
      // }
    },
  };
};
