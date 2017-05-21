import "setimmediate";
import h from "react-hyperscript";
import { render } from "react-dom";
import { Container } from "cerebral/react";
import { module as controller, App } from "./app/boundary";

render(h(Container, { controller }, h(App)), document.querySelector("#app"));

import ReactDOMServer from "react-dom/server";
import { computeAppViewModel, appView } from "./app/boundary/component";
console.log(
  "str",
  ReactDOMServer.renderToString(
    appView(
      computeAppViewModel({
        controlStateName: "normal",
        count: 42,
        actionsDisabled: true,
      }),
    ),
  ),
);
