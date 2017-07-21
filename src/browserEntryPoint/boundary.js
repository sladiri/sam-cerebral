import h from "react-hyperscript";
import { render } from "react-dom";
import Devtools from "cerebral/devtools";
import { Controller } from "cerebral";
import { Container } from "cerebral/react";

import { moduleFactory } from "../appShell/control";
import { view } from "../appShell/boundary";

const controller = Controller({
  ...moduleFactory({ hasServerState: !!window.CEREBRAL_STATE }),
  devtools: Devtools({
    host: "localhost:8585",
    reconnect: false,
  }),
});

render(h(Container, { controller }, h(view)), document.querySelector("#app"));
