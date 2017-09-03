import { uniqBy } from "ramda";

const allDocsFactory = db => {
  const allDocs = async ids => {
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
  return allDocs;
};

const getFactory = ({ db, state }) => {
  const allDocs = allDocsFactory(db);
  const get = async ids => {
    const docs = await allDocs(ids);
    return docs;
  };
  return get;
};

const putFactory = ({ db, state }) => {
  const allDocs = allDocsFactory(db);
  const put = async doc => {
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
    console.log("Shim PUT", response);
    const docs = await allDocs();
    const updated = docs.rows.find(row => row.id === doc._id);
    return updated;

    // const { messageClock = -Infinity } = props;
    // const currentlock = Math.max(state.get("hidden.clock"), messageClock);
    // state.set("hidden.clock", currentlock + 1);
  };
  return put;
};

export default (db, state /* for debugging */) => {
  const context = {
    state,
    db,
  };

  if (!state.get("shim")) {
    state.set("shim", {
      shimId: `${new Date().valueOf() + Math.random()}`, // TODO: Should be globally unique.
      clock: 0, // TDOD: Handle wrap-around?
    });
  }

  return {
    get: getFactory(context),
    put: putFactory(context),
  };
};
