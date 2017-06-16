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

  await initAll();

  render(h(Container, { controller }, h(view)), document.querySelector("#app"));

  // TODO: Edge fails to call NAP
  controller.emit("doNapAfterInit"); // Postpone NAP after first render, because server cannot run NAP.
  controller.emit("unblockActions"); // Required, if no NAP was called.

  function initAll() {
    controller.getSignal("init")({});
    controller.getSignal("napSack.init")({});
    return waitForSignals(["init", "napSack.init"]);

    function waitForSignals(signals = []) {
      return new Promise((resolve, reject) => {
        let inits = signals.length;

        controller.on("end", execution => {
          try {
            if (signals.includes(execution.name)) {
              signals = signals.filter(name => name !== execution.name);
              inits -= 1;
            }

            if (inits === 0) {
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  }
})();
