import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import Devtools from "cerebral/devtools";
import { Controller } from "cerebral";
import { Container } from "cerebral/react";
import { moduleFactory, view } from "../universal/app/boundary";

const controller = Controller({
  ...moduleFactory(),
  devtools: Devtools({
    host: "localhost:8585",
    reconnect: true,
    preventExternalMutations: false,
  }),
});

render(h(Container, { controller }, h(view)), document.querySelector("#app"));

import PouchDB from "pouchdb";
// PouchDB.debug.enable("*");

testDb();

async function testDb() {
  let x;
  let db;
  let local;

  await ensureDb();

  const david = await ensureDavid();
  console.log("david done", david);
  x = await local.put({ ...david, age: david.age + 1 });
  console.log("david put", await local.get(david._id).catch(e => e));

  async function ensureDavid() {
    try {
      const _id = "dave@gmail.com";

      x = await local.get(_id).catch(e => e);
      if (!x.error) return { ...x, retrieved: true };

      const david = {
        _id,
        name: "David",
        age: 69,
      };
      x = await local.put(david).then(o => ({ _rev: o.rev })).catch(e => e);
      if (!x.error) return { ...x, ...david, created: true };
    } catch (e) {
      console.error("sladi", e);
    }
  }

  async function ensureDb() {
    try {
      db = new PouchDB("http://localhost:5984/mydb", { skip_setup: true });
      x = await db.allDocs();
      console.log(
        "remote connected",
        x,
        "\n",
        x.rows.map(r => `${r.id}, ${r.value.rev}`),
      );

      local = new PouchDB("local_mydb");
      x = await local.allDocs();
      console.log(
        "local connected",
        x,
        "\n",
        x.rows.map(r => `${r.id}, ${r.value.rev}`),
      );

      local
        .sync(db, { live: true, retry: true })
        .on("error", console.error.bind(console))
        .on("change", function(change) {
          console.log("Ch-Ch-Changes", change);
        });
    } catch (e) {
      console.error("sladi", e);
    }
  }
}
