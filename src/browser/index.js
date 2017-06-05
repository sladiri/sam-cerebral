import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import { Container } from "cerebral/react";
import {
  controller as appController,
  view as App,
} from "../universal/app/boundary";

render(
  h("div", [h(Container, { controller: appController }, h(App))]),
  document.querySelector("#app"),
);
