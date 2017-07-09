import PouchDB from "pouchdb";
import pouchMemory from "pouchdb-adapter-memory";

// PouchDB.debug.enable("*");

export function pouchDbFactory(pouchOptions = {}) {
  const db = {};

  const getDbPromise = async () => {
    const { local } = await ensureDbSync(pouchOptions);

    db.local = {
      async get(id) {
        return local.get(id);
      },
      async allDocs(options = { include_docs: true }) {
        return local.allDocs(options);
      },
      async put(object) {
        return local.put(object);
      },
      async post(object) {
        return local.post(object);
      },
    };
  };

  db.init = getDbPromise();

  return db;
}

async function ensureDbSync({
  inMemory,
  remoteDbHost,
  remoteDbName,
  localDbName,
}) {
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
    if (hasServerSideState()) {
      console.warn("Server side state from DB is not synced.");
    }
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
      .on("error", console.error.bind(console))
      .on("change", function(change) {
        console.log(`Ch-Ch-Changes [${localDbName}]`, change);
      });
  }

  return { remote, local };
}

function hasServerSideState() {
  /*eslint-disable no-undef*/
  return typeof window !== "undefined" && window.stateIsFromServer;
  /*eslint-enable no-undef*/
}
