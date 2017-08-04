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
  return docs.rows.map(
    r => `id=[${r.id.substr(0, 10)}...];rev=[${r.value.rev.substr(0, 10)}...]`,
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

const doReplicate = async (source, sourceName, target, targetName) => {
  return new Promise((resolve, reject) => {
    source.replicate.to(target).on("complete", resolve).on("error", reject);
  })
    .then(() => {
      return Promise.all([getDocsLog(source), getDocsLog(target)]);
    })
    .then(([sourceLog, targetLog]) => {
      console.log(
        `[${sourceName}] replicated to [${targetName}]`,
        "\n",
        `[${sourceName}]: `,
        sourceLog,
        "\n",
        `[${targetName}]: `,
        targetLog,
      );
    });
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
    `Syncing [${firstName}] <-> [${secondName}]`,
    handler,
    "\n",
    `[${firstName}]: `,
    await getDocsLog(first),
    "\n",
    `[${secondName}]: `,
    await getDocsLog(second),
  );
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
    // For debugging
    const cache = await getCache(cacheDbName);
    console.log("Remote DB connected, destroying local cache DB.");
    await cache.destroy();
  }
  const cache = await getCache(cacheDbName);
  const inMemory = await getInMemory(inMemoryDbName);

  if (remote) {
    window.sync = {}; // Dev helper
    const replyOpts = {
      live: true,
      retry: true,
      filter(doc) {
        return !!doc.happenedAfter;
      },
    };
    const addCancel = (id, handler) => {
      handler.on("complete", function(info) {
        console.warn(
          `Syncing canceled: [${cacheDbName}] <-> [${remoteDbName}]`,
          info,
        );
        window.sync[`cancel${id}`] = null;
      });
      window.sync[`cancel${id}`] = handler.cancel.bind(handler);
    };
    await doReplicate(remote, remoteDbName, cache, cacheDbName);
    {
      //   const { handler } = await doSync(
      //   cache,
      //   cacheDbName,
      //   remote,
      //   remoteDbName,
      //   replyOpts,
      // );
      // addCancel("Replies", handler);
    }
    {
      const { handler } = await doSync(
        cache,
        cacheDbName,
        remote,
        remoteDbName,
      );
      addCancel("All", handler);
    }
    window.sync.syncAll = async () => {
      if (window.sync.cancelAll) {
        return;
      }
      const { handler } = await doSync(
        cache,
        cacheDbName,
        remote,
        remoteDbName,
      );
      addCancel("All", handler);
    };
    window.sync.syncReplies = async () => {
      if (window.sync.cancelReplies) {
        return;
      }
      const { handler } = await doSync(
        cache,
        cacheDbName,
        remote,
        remoteDbName,
        replyOpts,
      );
      addCancel("Replies", handler);
    };
  }

  await doReplicate(cache, cacheDbName, inMemory, inMemoryDbName);
  await doSync(inMemory, inMemoryDbName, cache, cacheDbName);

  return { remote, cache, inMemory };
};
