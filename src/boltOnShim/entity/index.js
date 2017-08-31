import { partition, intersection, uniqBy } from "ramda";

const allDocs = async (db, ids) => {
  const options = {
    include_docs: true,
    conflicts: true,
  };
  if (ids) options.keys = ids;
  const docs = await db.allDocs(options);
  const withConflichts = docs.rows.filter(d => !!d.doc._conflicts);
  if (withConflichts.length) {
    console.warn("conflicts in documents", withConflichts);
    debugger;
  }
  return docs;
};

const clearDocs = async db => {
  const docs = await allDocs(db);
  const responses = await Promise.all(
    docs.rows.map(row => db.remove(row.id, row.value.rev)),
  );
  const notOk = responses.filter(r => !r.ok);
  if (notOk.length) {
    console.warn("removeAll responses not ok", responses);
    debugger;
  }
  return await allDocs(db);
};

export default dbPromise => {
  let db;

  const accept = async ({ state, props }) => {
    let tick;
    if (!db) {
      const { inMemory } = await dbPromise;
      db = inMemory;
    }

    // For debugging, save hidden state to Cerebral's state.
    if (!state.get("_")) {
      state.set("_", {
        shimId: `${Math.random()}`, // TODO: Should be globally unique.
        clock: 0, // TDOD: Handle wrap-around?
        available: [],
        missing: [],
        missingIds: [],
      });

      const docs = await allDocs(db);
      state.set("_.docs", docs);
      tick = true;
    }

    {
      const { doc } = props;
      if (doc) {
        const { inResponseTo } = doc;
        let previous;
        if (inResponseTo.length === 1) {
          previous = inResponseTo[0];
        }
        if (previous) {
          doc.inResponseTo.push(previous);
          doc.inResponseTo = uniqBy(x => x, doc.inResponseTo);
        }
        const payload = {
          updated: Date.now(),
          ...doc,
        };
        const response = await db.put(payload);
        if (!response.ok) {
          console.warn("put response not ok", response);
          debugger;
        }
        const docs = await allDocs(db);
        state.set("_.docs", docs);
        tick = true;
      }
    }

    {
      const { clear } = props;
      if (clear) {
        const docs = await clearDocs(db);
        state.set("_.docs", docs);
        tick = true;
      }
    }

    if (tick) {
      const { messageClock = -Infinity } = props;
      const currentlock = Math.max(state.get("_.clock"), messageClock);
      state.set("_.clock", currentlock + 1);
    }
  };

  const computeStateRepresentation = state => {
    const { _: { docs = { rows: [] } } } = state.get();

    const [available, missing] = partition(
      ({ doc }) =>
        !doc.inResponseTo.length ||
        doc.inResponseTo.length ===
          intersection(doc.inResponseTo, docs.rows.map(d => d.id)).length,
      docs.rows,
    );

    state.set("_.available", available);
    state.set("_.missing", missing);

    // const missingIds = flatten(missing.map(row => row.doc.inResponseTo));
    // state.set("_.missingIds", missingIds);

    state.set("docs", { rows: available });

    // if (missingIds.length) {
    //   const notFoundIds = docsMany.rows
    //     .filter(row => !!row.error)
    //     .map(row => row.key);
    //   const missingAndNotFound = intersection(missingIds, notFoundIds); // Avoid loop in development.
    //   if (!missingAndNotFound.length) {
    //     return [["missing", ["allDocs"]]];
    //   }
    //   if (missingAndNotFound.length) {
    //     console.warn("Could not find missing docs", missingAndNotFound);
    //   }
    // }

    return [["normal", ["sync", "put", "getAll", "removeAll"]]];
  };

  const computeNextAction = (controlState, model) => {
    // if (controlState === "missing") {
    //   const { _: { missingIds } } = model;
    //   return [[["allDocs", { ids: missingIds }]]];
    // }
  };

  return { accept, computeStateRepresentation, computeNextAction };
};
