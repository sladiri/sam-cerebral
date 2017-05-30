import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import { Container } from "cerebral/react";
import {
  controller as appController,
  view as App,
} from "../universal/app/boundary";
import {
  controller as napSackController,
  view as NapSack,
} from "../universal/nap-sack/boundary";

render(
  h("div", [
    h(Container, { controller: appController }, h(App)),
    h(Container, { controller: napSackController }, h(NapSack)),
  ]),
  document.querySelector("#app"),
);
