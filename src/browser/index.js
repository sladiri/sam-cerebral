import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import { Container } from "cerebral/react";
import { controller, component } from "../universal/app/boundary";

render(
  h("div", [h(Container, { controller }, h(component))]),
  document.querySelector("#app"),
);
