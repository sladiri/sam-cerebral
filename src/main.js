import "setimmediate";
import React from "react";
import { render } from "react-dom";
import { Container } from "cerebral/react";
import { controller as AppController, component as App } from "./app";

render(
  <Container controller={AppController}>
    <App />
  </Container>,
  document.querySelector("#app"),
);
