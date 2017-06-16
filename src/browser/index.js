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

  // controller.getSignal("init")({});
  // controller.getSignal("napSack.init")({});
  await initAll();

  render(h(Container, { controller }, h(view)), document.querySelector("#app"));

  controller.emit("doInitNap"); // Postpone NAP after first render, because server cannot run NAP.

  function initAll() {
    controller.getSignal("init")({});
    controller.getSignal("napSack.init")({});
    // return waitForNaps(["", "napSack"]);
    return waitForSignals(["init", "napSack.init"]);

    function waitForNaps(prefixes = []) {
      return Promise.all(
        prefixes.map(
          prefix =>
            new Promise((resolve, reject) => {
              try {
                controller.once(
                  `napDone${prefix ? `-${prefix}` : ""}`,
                  resolve,
                );
              } catch (error) {
                reject(error);
              }
            }),
        ),
      );
    }

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
