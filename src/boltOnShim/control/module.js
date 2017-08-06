import { samFactory } from "../../samStep/boundary";
import entityFactory from "../entity";
import actionFactory from "./actions";
import { pouchDbFactory } from "../../pouchdb/boundary";

const db = pouchDbFactory({
  remoteDbHost: "http://localhost:5984",
  remoteDbName: "remote_blog",
  cacheDbName: "cached_blog",
  inMemoryDbName: "inMemory_blog",
});

const { accept, computeStateRepresentation, computeNextAction } = entityFactory(
  db,
);

export default prefix =>
  samFactory({
    prefix,
    accept,
    computeStateRepresentation,
    computeNextAction,
    actions: actionFactory(db),
  });
