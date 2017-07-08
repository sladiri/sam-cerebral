import { pouchDbFactory } from "../../pouchdb";

const pouchOptions = {
  inMemory: true,
  remoteDbHost: "http://localhost:5984",
  remoteDbName: "app-db",
  localDbName: "local_app-db",
};
export default pouchDbFactory(pouchOptions);
