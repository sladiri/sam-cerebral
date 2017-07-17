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

process.on("unhandledRejection", error => {
  console.error("unhandledRejection\n", error);
});

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

let routerWorkAroundNumber = 0;
app.use(async ctx => {
  const {
    page: rootPage,
    prefix: rootPageModulePrefix,
    signalName: rootSignal,
  } = routeMap["/"];
  const {
    page: currentPage,
    prefix: pageModulePrefix,
    signalName: pageSignal,
  } =
    routeMap[ctx.url] || {};

  if (!currentPage) {
    ctx.body = "<h1>404 - Not Found</h1>";
    ctx.status = 404;
    return;
  }

  const controller = UniversalController(moduleFactory(routerWorkAroundNumber));

  // Check router documentation for "routerWorkAroundNumber".
  routerWorkAroundNumber = getNextWorkaroundNumber(routerWorkAroundNumber);
  const pagesToInit = [
    waitForNap(controller, rootPageModulePrefix, [
      rootSignal,
      { routerWorkAroundNumber },
    ]),
  ];
  if (currentPage !== rootPage) {
    pagesToInit.push(
      waitForNap(controller, pageModulePrefix, [
        pageSignal,
        { routerWorkAroundNumber },
      ]),
    );
  }
  await Promise.all(pagesToInit);

  const script = controller.getScript();
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

function waitForNap(controller, prefix, [sequence, payload] = []) {
  const napDone = new Promise((resolve, reject) => {
    try {
      controller.once(`napDone${prefix ? `-${prefix}` : ""}`, resolve);
    } catch (error) {
      reject(error);
    }
  });

  if (sequence) {
    const signal = controller.getSignal(sequence);
    signal(payload);
  }

  return napDone;
}

function getNextWorkaroundNumber(routerWorkAroundNumber) {
  return routerWorkAroundNumber + 1 > 7 ? 0 : routerWorkAroundNumber + 1;
}
