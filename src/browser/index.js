import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import Devtools from "cerebral/devtools";
import { Controller } from "cerebral";
import { Container } from "cerebral/react";
import { moduleFactory, view } from "../universal/app/boundary";

const controller = Controller({
  ...moduleFactory().module,
  devtools: Devtools({
    host: "localhost:8585",
    reconnect: true,
    preventExternalMutations: true, // TODO: This causes a bug, if used state is not inside a subobject.
  }),
});

render(h(Container, { controller }, h(view)), document.querySelector("#app"));
