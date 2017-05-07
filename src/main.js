import "setimmediate";
import React from "react";
import { render } from "react-dom";
import { Container } from "cerebral/react";
import controller from "./controller";
import App from "./app";

// When a function tree is executed
controller.on("start", (execution, payload) => {
  console.log("function tree start", { execution, payload });
});

// When a function tree execution has ended
controller.on("end", (execution, payload) => {
  console.log("function tree end", { execution, payload });
});

render(
  <Container controller={controller}>
    <App />
  </Container>,
  document.querySelector("#app"),
);
