import "setimmediate";
import React from "react";
import { render } from "react-dom";
import { Container } from "cerebral/react";
import { module, App } from "./app/boundary";

render(
  <Container controller={module}>
    <App />
  </Container>,
  document.querySelector("#app"),
);
