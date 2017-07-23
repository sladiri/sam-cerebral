import PouchDB from "pouchdb";
import pouchMemory from "pouchdb-adapter-memory";

// PouchDB.debug.enable("*");

export const pouchDbFactory = (pouchOptions = {}) => {
  const db = {};

  const getDbPromise = async () => {
    const { local } = await ensureDbSync(pouchOptions);

    db.local = local;
  };

  db.init = getDbPromise();

  return db;
};

const ensureDbSync = async ({
  inMemory,
  remoteDbHost,
  remoteDbName,
  localDbName,
}) => {
  const localDbOptions = {};
  if (inMemory) {
    PouchDB.plugin(pouchMemory);
    localDbOptions.adapter = "memory";
  }

  let response;
  let remote;
  try {
    remote = new PouchDB(`${remoteDbHost}/${remoteDbName}`, {
      skip_setup: true,
    });
    response = await remote.allDocs();
    console.log(
      `remote [${remoteDbName}] connected`,
      response,
      "\n",
      response.rows.map(r => `${r.id}, ${r.value.rev}`),
    );
  } catch (e) {
    console.log("No remote DB connected.");
    remote = null;
  }

  const local = new PouchDB(localDbName, localDbOptions);

  if (remote) {
    response = await local.sync(remote, { retry: true });
    console.log(`local [${localDbName}] synced`, response);
  }

  response = await local.allDocs();
  console.log(
    `local [${localDbName}] ready`,
    response,
    "\n",
    response.rows.map(r => `${r.id}, ${r.value.rev}`),
  );

  if (remote) {
    local
      .sync(remote, { live: true, retry: true })
      .on("error", ::console.error)
      .on("change", change => {
        console.log(`Ch-Ch-Changes [${localDbName}]`, change);
      });
  }

  return { remote, local };
};
