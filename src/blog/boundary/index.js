import { viewFactory } from "./view";

import { viewFactory as SamStatusFactory } from "../../samStatus/boundary";

export const view = viewFactory(SamStatusFactory("blog"));
