import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import Devtools from "cerebral/devtools";
import { Controller } from "cerebral";
import { Container } from "cerebral/react";
import { moduleFactory, view } from "../universal/app/boundary";

const controller = Controller({
  ...moduleFactory(),
  devtools: Devtools({ host: "localhost:8585", reconnect: true }),
});

render(h(Container, { controller }, h(view)), document.querySelector("#app"));
