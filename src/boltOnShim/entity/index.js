import { partition, intersection, flatten } from "ramda";

/**
 * Bolt-on Shim Layer
 * 
 * The state holds the local store in form of a list of docs, and a single modified doc.
 */
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

    state.unset("_.docsMany");
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
      const { docsMany } = props;
      if (docsMany) {
        state.set("_.docsMany", docsMany);
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
      _: { docsMany = { rows: [] }, available = [], missingIds = [], doc },
    } = state.get();

    state.set("docs", { rows: available });

    if (missingIds.length) {
      const notFoundIds = docsMany.rows
        .filter(row => !!row.error)
        .map(row => row.key);
      const missingAndNotFound = intersection(missingIds, notFoundIds); // Avoid loop in development.
      if (!missingAndNotFound.length) {
        return [["missing", ["allDocs"]]];
      }
      if (missingAndNotFound.length) {
        console.warn("Could not find missing docs", missingAndNotFound);
      }
    }

    return [["normal", ["allDocs", "get", "put", "deleteAll"]]];
  };

  const computeNextAction = (controlState, model) => {
    if (controlState === "missing") {
      const { _: { missingIds } } = model;
      return [[["allDocs", { ids: missingIds }]]];
    }
  };
  return { accept, computeStateRepresentation, computeNextAction };
};
