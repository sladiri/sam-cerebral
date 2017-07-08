import PouchDB from "pouchdb";
import pouchMemory from "pouchdb-adapter-memory";

// PouchDB.debug.enable("*");

export function pouchDbFactory(pouchOptions = {}) {
  const db = {};

  const getDbPromise = async () => {
    const { remote, local } = await ensureDbSync(pouchOptions);

    async function foo() {
      const david = await ensureDavid(local);
      console.log("david ready", david);
      console.log(
        "david put",
        await local.put({ ...david, age: david.age + 1 }),
      );
    }

    db.remote = remote;
    db.local = local;
    db.foo = foo;
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
      "remote connected",
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
    console.log("local synced", response);
  }

  response = await local.allDocs();
  console.log(
    "local ready",
    response,
    "\n",
    response.rows.map(r => `${r.id}, ${r.value.rev}`),
  );

  if (remote) {
    local
      .sync(remote, { live: true, retry: true })
      .on("error", console.error.bind(console))
      .on("change", function(change) {
        console.log("Ch-Ch-Changes", change);
      });
  }

  return { remote, local };
}

async function ensureDavid(db) {
  const _id = "dave@gmail.com";
  let response;

  response = await db.get(_id).catch(e => e);
  if (!response.error) {
    return response.retrieved ? response : { ...response, retrieved: true };
  }

  const david = {
    _id,
    name: "David",
    age: 69,
    ran: `${Math.random()}`,
  };
  response = await db.put(david).then(o => ({ _rev: o.rev })).catch(e => e);
  if (!response.error) {
    return response.created
      ? { ...response, ...david }
      : { ...response, ...david, created: true };
  }
}

function hasServerSideState() {
  /*eslint-disable no-undef*/
  return typeof window !== "undefined" && window.stateIsFromServer;
  /*eslint-enable no-undef*/
}
