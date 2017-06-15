import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { UniversalController } from "cerebral";
import { Container } from "cerebral/react";
import { renderToString } from "react-dom/server";
import { module, component } from "../universal/app/boundary";

const controller = UniversalController(module);

const html = renderToString(h(Container, { controller }, h(component)));
console.log("server rendered string\n", html, "\n");

controller
  .run(
    [
      function myAction({ state, props }) {
        console.log("server has state\n", state.get(), "\n");
        state.set("count", props.count);
      },
    ],
    {
      count: 42,
    },
  )
  .then(() => {
    console.log("server rendered script\n", controller.getScript(), "\n");
  });
