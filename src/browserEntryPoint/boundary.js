import h from "react-hyperscript";
import { render } from "react-dom";
import Devtools from "cerebral/devtools";
import { Controller } from "cerebral";
import { Container } from "cerebral/react";

import { moduleFactory } from "../appShell/control";
import { view } from "../appShell/boundary";

const debuggerPort = localStorage.getItem("cerebraldebuggerport") || 8585;

const controller = Controller({
  ...moduleFactory({ hasServerState: !!window.CEREBRAL_STATE }),
  devtools: Devtools({
    host: `localhost:${debuggerPort}`,
    reconnect: false,
    preventExternalMutations: false, // prevent bug in current Cerebral
  }),
});

render(h(Container, { controller }, h(view)), document.querySelector("#app"));
