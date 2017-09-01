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
    if (!state.get("hidden")) {
      state.set("hidden", {
        shimId: `${new Date().valueOf() + Math.random()}`, // TODO: Should be globally unique.
        clock: 0, // TDOD: Handle wrap-around?
        available: [],
        missing: [],
        missingIds: [],
      });

      const docs = await allDocs(db);
      state.set("hidden.docs", docs);
      tick = true;
    }

    {
      const { doc } = props;
      if (doc) {
        const { happenedAfter } = doc;
        let previous;
        if (happenedAfter.length === 1) {
          previous = happenedAfter[0];
        }
        if (previous) {
          doc.happenedAfter.push(previous);
          doc.happenedAfter = uniqBy(x => x, doc.happenedAfter);
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
        state.set("hidden.docs", docs);
        tick = true;
      }
    }

    {
      const { clear } = props;
      if (clear) {
        const docs = await clearDocs(db);
        state.set("hidden.docs", docs);
        tick = true;
      }
    }

    if (tick) {
      const { messageClock = -Infinity } = props;
      const currentlock = Math.max(state.get("hidden.clock"), messageClock);
      state.set("hidden.clock", currentlock + 1);
    }
  };

  const computeStateRepresentation = state => {
    const { hidden } = state.get();
    const docs = (hidden && hidden.docs) || { rows: [] };

    const [available, missing] = partition(
      ({ doc }) =>
        !doc.happenedAfter.length ||
        doc.happenedAfter.length ===
          intersection(doc.happenedAfter, docs.rows.map(d => d.id)).length,
      docs.rows,
    );

    state.set("hidden.available", available);
    state.set("hidden.missing", missing);

    // const missingIds = flatten(missing.map(row => row.doc.happenedAfter));
    // state.set("hidden.missingIds", missingIds);

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
    //   const { hidden: { missingIds } } = model;
    //   return [[["allDocs", { ids: missingIds }]]];
    // }
  };

  return { accept, computeStateRepresentation, computeNextAction };
};
