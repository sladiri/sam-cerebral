import "setimmediate";
import React from "react";
import { render } from "react-dom";
import { Container } from "cerebral/react";
import { AppController, App } from "./boundary/app-module";

render(
  <Container controller={AppController}>
    <App />
  </Container>,
  document.querySelector("#app"),
);
