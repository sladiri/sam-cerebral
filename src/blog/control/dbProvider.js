import shimFactory from "../../boltOnShim/boundary";

import { sync as _sync } from "../../pouchdb/boundary";

const syncFactory = ({ cache, inMemory }) => {
  let syncHandler;

  const sync = async ({ live = false, stop = false } = {}) => {
    if ((live && syncHandler) || (stop && !syncHandler)) {
      return;
    }
    if (stop && syncHandler) {
      syncHandler.cancel();
      syncHandler = false;
    }
    const { handler } = await _sync(inMemory, cache, { live, retry: live });
    if (live && !stop) {
      syncHandler = handler;
    }
    return { sync: true };
  };

  return sync;
};

const clearFactory = db => async () => {
  const docs = await db.allDocs();
  const responses = await Promise.all(
    docs.rows.map(row => db.remove(row.id, row.value.rev)),
  );
  const notOk = responses.filter(r => !r.ok);
  if (notOk.length) {
    console.warn("clear not ok", responses);
    debugger;
  }
};

const providerFactory = (dbOptions, state) => {
  const shim = shimFactory(dbOptions.inMemory, state);
  const clear = clearFactory(dbOptions.inMemory);
  const sync = syncFactory(dbOptions);

  return {
    ...shim,
    clear,
    sync,
  };
};

export default db => {
  let cachedProvider;
  const provider = context => {
    if (!cachedProvider) {
      cachedProvider = providerFactory(db, context.state);
    }
    context.db = cachedProvider;
    return context;
  };
  return provider;
};
