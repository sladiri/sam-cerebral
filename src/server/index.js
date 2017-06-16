import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import serve from "koa-static";
import Koa from "koa";
import * as ReactFreeStyle from "react-free-style";
import { UniversalController } from "cerebral";
import { Container } from "cerebral/react";
import { renderToString } from "react-dom/server";
import { module, view } from "../universal/app/boundary";

const app = new Koa();

app.use(serve("./static"));

app.use(ctx => {
  const controller = UniversalController(module);
  controller.getSignal("init")({});
  controller.getSignal("napSack.init")({});

  const html = renderToString(h(Container, { controller }, h(view)));
  const script = controller.getScript();

  const styles = ReactFreeStyle.rewind().toString(); // Run last to prevent empty styles.

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
