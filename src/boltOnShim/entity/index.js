import { partition, intersection, flatten } from "ramda";

export default dbPromise => {
  let db;

  const accept = async ({ state, props }) => {
    const shim = state.get();

    if (!db) {
      db = await dbPromise;
    }

    if (!shim._) {
      state.set("_", { available: [], missing: [], missingIds: [] });
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
          ({ doc }) =>
            !doc.inResponseTo.length ||
            doc.inResponseTo.length ===
              intersection(doc.inResponseTo, docs.rows.map(d => d.id)).length,
          docs.rows,
        );

        state.set("_.available", available);
        state.set("_.missing", missing);

        const missingIds = flatten(missing.map(row => row.doc.inResponseTo));
        state.set("_.missingIds", missingIds);
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
      _: { docMany = { rows: [] }, available = [], missingIds = [], doc },
    } = state.get();

    state.set("docs", { rows: available });
    if (doc) {
      state.set("doc", doc);
    }

    if (missingIds.length) {
      const notFoundIds = docMany.rows
        .filter(row => !!row.error)
        .map(row => row.key);
      const missingAndNotFound = intersection(missingIds, notFoundIds); // Avoid loop in development.
      if (!missingAndNotFound.length) {
        return [["missing", ["getMany"]]];
      }
      if (missingAndNotFound.length) {
        console.warn("Could not find missing docs", missingAndNotFound);
      }
    }

    return [["normal", ["allDocs", "get", "post", "put", "deleteAll"]]];
  };

  const computeNextAction = (controlState, model) => {
    if (controlState === "missing") {
      const { _: { missingIds } } = model;
      return [[["getMany", { ids: missingIds }]]];
    }
  };
  return { accept, computeStateRepresentation, computeNextAction };
};
