import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import { wrap } from "react-free-style";
import { Style } from "../universal/app/view/styles";
import { Container } from "cerebral/react";
import {
  controller as appController,
  view as App,
} from "../universal/app/boundary";

render(
  h("div", [h(Container, { controller: appController }, h(wrap(App, Style)))]),
  document.querySelector("#app"),
);
