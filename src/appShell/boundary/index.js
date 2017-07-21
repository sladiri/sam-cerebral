import { connect } from "cerebral/react";
import { state } from "cerebral/tags";

import AppShell from "./AppShell";

export const view = connect(
  {
    currentPage: state`currentPage`,
  },
  AppShell,
);
