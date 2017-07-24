export default db => {
  const actions = {
    async accept({ state, props }) {
      {
        if (props.noop) return;
      }

      {
        const { _hidden } = props;
        if (_hidden) {
          state.set("_hidden", _hidden);
        }
      }

      state.unset("doc");
      state.unset("ok");
      state.unset("id");
      state.unset("rev");

      {
        const { docs } = props;
        if (docs) {
          state.set("docs", docs);
        }
      }

      {
        const { doc } = props;
        if (doc) {
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

      return [["normal", ["allDocs", "get", "post", "put"]]];
    },

    computeNextAction(controlState) {
      // if (controlState === "low") {
      //   return [[["foo"]]];
      // }
    },
  };
  return actions;
};
