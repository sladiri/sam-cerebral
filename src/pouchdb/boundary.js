import PouchDB from "pouchdb";
import pouchMemory from "pouchdb-adapter-memory";

PouchDB.plugin(pouchMemory);
// PouchDB.debug.enable("*");

export const pouchDbFactory = (pouchOptions = {}) => {
  const getDbPromise = async () => {
    const { inMemory } = await ensureDbSync(pouchOptions);
    return inMemory;
  };
  return getDbPromise();
};

const getDocsLog = async db => {
  const docs = await db.allDocs();
  return docs.rows.map(r => `id=[${r.id}];rev=[${r.value.rev}]`);
};

const logDbReady = async (db, dbName) => {
  console.log(`[${dbName}] connected`, db, "\n", await getDocsLog(db));
};

const getRemote = async (remoteDbHost, dbName) => {
  if (!remoteDbHost || !dbName) {
    console.log("No remote DB provided.");
    return;
  }
  let remote;
  try {
    remote = new PouchDB(`${remoteDbHost}/${dbName}`, {
      skip_setup: true,
    });
    await logDbReady(remote, dbName);
  } catch (e) {
    console.log("Could not connect to remote DB.");
    remote = null;
  }
  return remote;
};

const getCache = async dbName => {
  if (!dbName) {
    throw new Error("Must provide name for cache DB.");
  }
  const cache = new PouchDB(dbName);
  await logDbReady(cache, dbName);
  return cache;
};

const getInMemory = async dbName => {
  if (!dbName) {
    throw new Error("Must provide name for in-memory DB.");
  }
  const dbOptions = { adapter: "memory" };
  const inMemory = new PouchDB(dbName, dbOptions);
  await logDbReady(inMemory, dbName);
  return inMemory;
};

const doReplicate = async (from, fromName, to, toName) => {
  const handler = await to.replicate.from(from);
  console.log(
    `[${fromName}] replicated to [${toName}]`,
    handler,
    "\n",
    await getDocsLog(to),
  );

  // handler.on("complete", function(info) {
  //   // replication was canceled!
  // });
  // handler.cancel(); // <-- this cancels it
};

const doSync = async (
  first,
  firstName,
  second,
  secondName,
  syncOptions = { live: true, retry: true },
) => {
  const handler = first
    .sync(second, syncOptions)
    .on("error", error => {
      console.error(`Ch-Ch-Changes! [${firstName}] <-> [${secondName}]`, error);
    })
    .on("change", change => {
      console.log(`Ch-Ch-Changes! [${firstName}] <-> [${secondName}]`, change);
    });
  console.log(
    `[${firstName}] syncing with [${secondName}]`,
    handler,
    "\n",
    `[${firstName}]: `,
    await getDocsLog(first),
    "\n",
    `[${secondName}]: `,
    await getDocsLog(second),
  );

  // handler.on("complete", function(info) {
  //   // replication was canceled!
  // });
  // handler.cancel(); // <-- this cancels it
};

const ensureDbSync = async ({
  remoteDbHost,
  remoteDbName,
  cacheDbName,
  inMemoryDbName,
}) => {
  const remote = await getRemote(remoteDbHost, remoteDbName);
  const cache = await getCache(cacheDbName);
  const inMemory = await getInMemory(inMemoryDbName);

  if (remote) {
    await doReplicate(remote, remoteDbName, cache, cacheDbName);
    await doSync(cache, cacheDbName, remote, remoteDbName);
  }

  await doReplicate(cache, cacheDbName, inMemory, inMemoryDbName);
  await doSync(inMemory, inMemoryDbName, cache, cacheDbName);

  return { remote, cache, inMemory };
};
