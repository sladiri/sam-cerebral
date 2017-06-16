import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import { UniversalController } from "cerebral";
import { Container } from "cerebral/react";
import { renderToString } from "react-dom/server";
import { module, view } from "../universal/app/boundary";
import serve from "koa-static";
import Koa from "koa";
import * as ReactFreeStyle from "react-free-style";

const app = new Koa();

app.use(serve("./static"));

app.use(async ctx => {
  const controller = UniversalController(module);
  controller.getSignal("init")({});
  controller.getSignal("napSack.init")({});

  const styles = ReactFreeStyle.rewind().toString();
  const html = renderToString(h(Container, { controller }, h(view)));
  const script = controller.getScript();

  ctx.body = `
    <!doctype html>
    <html lang=en>

    <head>
      <base href="/">
      <meta charset=utf-8>
      <title>SAM - Cerebral</title>
      ${styles}
    </head>

    <body>
      <div id="app">${html}</div>
      <script src="vendor/rq.js"></script>
      <script src="dist/bundle.js"></script>
      ${script}`;
});

app.listen(3000);
console.log("Listening on http://localhost:3000");
