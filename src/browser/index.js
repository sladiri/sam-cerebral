import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import { Container } from "cerebral/react";
import { controller, App } from "../universal/app/boundary";

render(h(Container, { controller }, h(App)), document.querySelector("#app"));
