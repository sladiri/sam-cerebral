import { partition, intersection } from "ramda";

export default dbPromise => {
  let db;

  const accept = async ({ state, props }) => {
    const shim = state.get();

    if (!db) {
      db = await dbPromise;
    }

    if (!shim._) {
      state.set("_", {});
    }

    state.unset("_.doc");
    state.unset("_.docMany");
    state.unset("_.ok");
    state.unset("_.id");
    state.unset("_.rev");

    {
      const { docs } = props;
      if (docs) {
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
        state.set("_.doc", doc);
      }
    }

    {
      const { docMany } = props;
      if (docMany) {
        state.set("_.docMany", docMany);
      }
    }

    {
      const { ok } = props;
      if (ok !== undefined) {
        state.set("_.ok", ok);
      }
    }

    {
      const { id } = props;
      if (id) {
        state.set("_.id", id);
      }
    }

    {
      const { rev } = props;
      if (rev) {
        state.set("_.rev", rev);
      }
    }
  };

  const computeStateRepresentation = state => {
    const {
      _: { docMany = { rows: [] }, available = [], missing = [] },
    } = state.get();

    state.set("docs", { rows: available });

    const missingIds = missing.map(row => row.doc.happenedAfter._id);
    const notFoundIds = docMany.rows
      .filter(row => !!row.error)
      .map(row => row.key);
    const missingAndNotFound = intersection(missingIds, notFoundIds); // Avoid loop in development.
    if (missing.length && !missingAndNotFound.length) {
      return [["missing", ["getMany"]]];
    }
    if (missingAndNotFound.length) {
      console.warn("Could not find missing docs", missingAndNotFound);
    }

    return [["normal", ["allDocs", "get", "post", "put", "deleteAll"]]];
  };

  const computeNextAction = (controlState, model) => {
    if (controlState === "missing") {
      const { _: { missing } } = model;
      const ids = missing.map(row => row.doc.happenedAfter._id);
      return [[["getMany", { ids }]]];
    }
  };
  return { accept, computeStateRepresentation, computeNextAction };
};
