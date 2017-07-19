import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import Devtools from "cerebral/devtools";
import { Controller } from "cerebral";
import { Container } from "cerebral/react";
import moduleFactory from "../universal/modules/AppShell";
import view from "../universal/components/AppShell";

const controller = Controller({
  ...moduleFactory(),
  devtools: Devtools({
    host: "localhost:8585",
    reconnect: false,
  }),
});

render(h(Container, { controller }, h(view)), document.querySelector("#app"));
