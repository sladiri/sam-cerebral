import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import Devtools from "cerebral/devtools";
import { Controller } from "cerebral";
import { Container } from "cerebral/react";
import { module, view } from "../universal/app/boundary";

const controller = Controller({
  ...module,
  devtools: Devtools({ host: "localhost:8585", reconnect: true }),
});

controller.getSignal("init")({});
controller.getSignal("napSack.init")({});
render(h(Container, { controller }, h(view)), document.querySelector("#app"));
