import { sync as _sync } from "../../pouchdb/boundary";

export default dbPromise => {
  let db;
  let cacheDb;
  let syncHandler;

  const init = async () => {
    const { cache, inMemory } = await dbPromise;
    db = inMemory;
    cacheDb = cache;
  };

  // Cerebral does not allow non-serializable props, so hold state here.
  const sync = async ({ props: { live = false, stop = false } }) => {
    if ((live && syncHandler) || (stop && !syncHandler)) {
      return;
    }
    if (stop && syncHandler) {
      syncHandler.cancel();
      syncHandler = false;
    }
    const { handler } = await _sync(db, cacheDb, { live, retry: live });
    if (live && !stop) {
      syncHandler = handler;
    }
    return { sync: true };
  };

  const put = ({ props: { data } }) => ({ doc: data });

  // Dummy payload, return current state to consumers.
  // Real fetching should be internal according to Bolt-on protocol.
  const getAll = () => ({ refresh: true });

  const removeAll = () => ({ clear: true });

  // const get = async ({ props: { id } }) => {
  //   const defaultOptions = {
  //     revs: true,
  //     revs_info: true,
  //     conflicts: true,
  //   };
  //   const doc = await db.get(id, defaultOptions);
  //   return { doc };
  // };

  // const remove = async ({ props: { id, rev } }) => {
  //   const response = await db.remove(id, rev);
  //   console.log("remove response", response);
  //   return await _allDocs();
  // };

  return { init, sync, put, getAll, removeAll };
};
