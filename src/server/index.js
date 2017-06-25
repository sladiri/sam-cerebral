import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import serve from "koa-static";
import Koa from "koa";
import * as ReactFreeStyle from "react-free-style";
import { UniversalController } from "cerebral";
import { Container } from "cerebral/react";
import { renderToString } from "react-dom/server";
import { moduleFactory, routeMap, view } from "../universal/app/boundary";

process.on("unhandledRejection", r => console.log(r));

const app = new Koa();

app.use(serve("./static"));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.log(error);
    ctx.status = error.status || 500;
    ctx.body = error.message;
    ctx.app.emit("error", error, ctx);
  }
});

app.use(async ctx => {
  const { page: rootPage, module: rootPageModulePrefix } = routeMap["/"];
  const { page: currentPage, module: pageModulePrefix } =
    routeMap[ctx.url] || {};

  if (!currentPage) {
    ctx.body = "<h1>404 - Not Found</h1>";
    ctx.status = 404;
    return;
  }

  const controller = UniversalController(moduleFactory());

  // TODO: Wait for rootRouted, it is always called. Can we prevent this?
  await waitForNaps(controller, ["router", rootPageModulePrefix]);

  if (currentPage !== rootPage) {
    await waitForNaps(
      controller,
      ["router", pageModulePrefix],
      [controller.module.signals[`${currentPage}Routed`].signal],
    );
  }

  const script = controller.getScript().replace("<script>", "<script defer>");
  const html = renderToString(h(Container, { controller }, h(view)));
  const styles = ReactFreeStyle.rewind().toString(); // Run last to prevent empty styles.

  ctx.body = `
    <!doctype html>
    <html lang=en>

    <head>
      <base href="/">
      <meta charset=utf-8>
      <title>SAM - Cerebral</title>
      ${script}
      ${styles}
      <script defer src="vendor/rq.js"></script>
      <script defer src="dist/bundle.js"></script>
    </head>

    <body>
      <div id="app">${html}</div>`;
});

app.listen(3000);
console.log("Listening on http://localhost:3000");

function waitForNaps(controller, prefixes, [signal, payload] = []) {
  const napsDone = Promise.all(
    prefixes.map(
      prefix =>
        new Promise((resolve, reject) => {
          try {
            controller.once(`napDone${prefix ? `-${prefix}` : ""}`, resolve);
          } catch (error) {
            reject(error);
          }
        }),
    ),
  );
  if (signal) {
    controller.runOnServer(signal, payload);
  }
  return napsDone;
}
