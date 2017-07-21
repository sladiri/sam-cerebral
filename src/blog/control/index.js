import { samFactory } from "../../samStep/boundary";
import {
  acceptFactory,
  computeControlState,
  computeNextAction,
} from "../entity";
import * as actions from "./actions";
import { pouchDbFactory } from "../../pouchdb/boundary";

const db = pouchDbFactory({
  inMemory: true,
  remoteDbHost: "http://localhost:5984",
  remoteDbName: "blog",
  localDbName: "local_blog",
});

export const moduleFactory = prefix =>
  samFactory({
    prefix,
    accept: acceptFactory(db),
    computeControlState,
    computeNextAction,
    actions,
  });
