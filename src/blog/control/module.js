import { samFactory } from "../../samStep/boundary";
import {
  accept,
  computeStateRepresentation,
  computeNextAction,
} from "../entity";
import * as actions from "./actions";

import pouchDbFactory from "../../pouchdb/boundary";

import shimProviderFactory from "./dbProvider";

const dbPromise = pouchDbFactory({
  remoteDbHost: "http://localhost:5984",
  remoteDbName: "remote_blog",
  cacheDbName: "cached_blog",
  inMemoryDbName: "inMemory_blog",
});

export default async prefix => {
  const db = await dbPromise;

  const module = {
    ...samFactory({
      prefix,
      accept,
      computeStateRepresentation,
      computeNextAction,
      actions,
    }),
    provider: shimProviderFactory(db),
  };

  return module;
};
