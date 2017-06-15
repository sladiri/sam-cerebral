import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import { Container } from "cerebral/react";
import { controller, view } from "../universal/app/boundary";

render(
  h("div", [h(Container, { controller }, h(view))]),
  document.querySelector("#app"),
);
