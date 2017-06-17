import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import Devtools from "cerebral/devtools";
import { Controller } from "cerebral";
import { Container } from "cerebral/react";
import { module, view } from "../universal/app/boundary";

(async function() {
  const controller = Controller({
    ...module,
    devtools: Devtools({ host: "localhost:8585", reconnect: true }),
  });

  render(h(Container, { controller }, h(view)), document.querySelector("#app"));

  const props = { _browserInit: true }; // TODO: Secure this?
  // Since NAP can be only called on the client, client needs to call an "empty" signal (init in our case),
  // (init has already been called on the server).
  controller.getSignal("init")(props);
  controller.getSignal("napSack.init")(props);
})();
