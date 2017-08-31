import PouchDB from "pouchdb";
import pouchMemory from "pouchdb-adapter-memory";

PouchDB.plugin(pouchMemory);
// PouchDB.debug.enable("*");

const getDocsLog = async db => {
  const docs = await db.allDocs();
  return docs.rows.map(
    r => `id=[${r.id.substr(0, 5)}...];rev=[${r.value.rev.substr(0, 7)}...]`,
  );
};

const logDbReady = async (db, dbName) => {
  console.log(`[${dbName}] connected`, "\n", await getDocsLog(db));
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

const getLocalDb = async (dbName, options) => {
  if (!dbName) {
    throw new Error("Must provide name for cache DB.");
  }
  const cache = new PouchDB(dbName, options);
  await logDbReady(cache, dbName);
  return cache;
};

export const replicate = async (
  source,
  target,
  sourceName = "source-DB",
  targetName = "target-DB",
) => {
  const result = await new Promise((resolve, reject) => {
    source.replicate.to(target).on("complete", resolve).on("error", reject);
  });
  console.log(
    `[${sourceName}] replicated to [${targetName}]`,
    "\n",
    result,
    "\n",
    `[${sourceName}]: `,
    await getDocsLog(source),
    "\n",
    `[${targetName}]: `,
    await getDocsLog(target),
  );
};

export const sync = async (
  first,
  second,
  syncOptions,
  firstName = "first-DB",
  secondName = "second-DB",
) => {
  let handler;
  if (syncOptions.live) {
    handler = first
      .sync(second, syncOptions)
      .on("error", error => {
        console.error(`Sync error [${firstName}] <-> [${secondName}]`, error);
      })
      .on("complete", result => {
        console.log(`Sync complete [${firstName}] <-> [${secondName}]`, result);
      })
      .on("change", change => {
        console.log(
          `Synced changes [${firstName}] <-> [${secondName}]`,
          change,
        );
      });
    console.log(`[${firstName}] syncing with [${secondName}]`);
  } else {
    const result = await new Promise((resolve, reject) => {
      first
        .sync(second, syncOptions)
        .on("error", reject)
        .on("complete", resolve)
        .on("change", change => {
          console.log(
            `Synced changes [${firstName}] <-> [${secondName}]`,
            change,
          );
        });
    });
    console.log(
      `[${firstName}] synced with [${secondName}]`,
      "\n",
      result,
      "\n",
      `[${firstName}]: `,
      await getDocsLog(first),
      "\n",
      `[${secondName}]: `,
      await getDocsLog(second),
    );
  }
  return { handler }; // Prevent bug because handler has Promise-like API.
};

const ensureDbSync = async ({
  remoteDbHost,
  remoteDbName,
  cacheDbName,
  inMemoryDbName,
}) => {
  const remote = await getRemote(remoteDbHost, remoteDbName);
  if (remote) {
    const cache = await getLocalDb(cacheDbName);
    console.log("Remote DB connected, destroying local DB.");
    await cache.destroy();
  }
  const cache = await getLocalDb(cacheDbName);
  const inMemory = await getLocalDb(inMemoryDbName, { adapter: "memory" });

  if (remote) {
    await replicate(remote, cache, remoteDbName, cacheDbName);
  }

  await replicate(cache, inMemory, cacheDbName, inMemoryDbName);
  // await sync(
  //   inMemory,
  //   cache,
  //   { live: true, retry: true },
  //   inMemoryDbName,
  //   cacheDbName,
  // );

  return { remote, cache, inMemory };
};

export const pouchDbFactory = (pouchOptions = {}) => ensureDbSync(pouchOptions);
