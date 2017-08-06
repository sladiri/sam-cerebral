import { partition } from "ramda";

export default dbPromise => {
  let db;

  const accept = async ({ state, props }) => {
    const shim = state.get();

    if (!db) {
      db = await dbPromise;
    }

    if (!shim._hidden) {
      state.set("_", {});
    }

    state.unset("doc");
    state.unset("ok");
    state.unset("id");
    state.unset("rev");

    {
      const { docs } = props;
      if (docs) {
        // TODO: filter causal cut
        state.set("_.docs", docs);
        const [available, missing] = partition(
          d =>
            !d.doc.happenedAfter ||
            docs.rows.find(dd => dd.id === d.doc.happenedAfter._id),
          docs.rows,
        );
        state.set("_.available", available);
        state.set("_.missing", missing);
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
  };

  const computeStateRepresentation = state => {
    {
      const { _: { docs, available } } = state.get();
      if (docs) {
        state.set("docs", { rows: available });
      }
    }

    // if (m.x < 5) {
    //   return [["low", ["foo"]]];
    // }

    return [["normal", ["allDocs", "get", "post", "put", "deleteAll"]]];
  };

  const computeNextAction = controlState => {
    // if (controlState === "low") {
    //   return [[["foo"]]];
    // }
  };
  return { accept, computeStateRepresentation, computeNextAction };
};
