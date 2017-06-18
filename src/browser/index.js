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

  if (!window.CEREBRAL_STATE) {
    controller.getSignal("init")({});
    controller.getSignal("napSack.init")({});
  }

  // Unblock actions on client after first signal.
  controller.runSignal("setBrowserInit", [
    ({ state }) => {
      state.set("sam.init", false);
      state.set("napSack.sam.init", false);
    },
  ]);
})();
