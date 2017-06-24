import "babel-polyfill";
import "setimmediate";
import h from "react-hyperscript";
import serve from "koa-static";
import Koa from "koa";
import * as ReactFreeStyle from "react-free-style";
import { UniversalController } from "cerebral";
import { Container } from "cerebral/react";
import { set } from "cerebral/operators";
import { state } from "cerebral/tags";
import { renderToString } from "react-dom/server";
import { module, view } from "../universal/app/boundary";
import { getModulePath, getSignal } from "../universal/util";

process.on('unhandledRejection', r => console.log(r));

// delete module.modules.router; // SSR causes error in Router

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
  const controller = UniversalController(module);
  // ctx.body = 'nope'

  let currentPage;
  let prefixes;
  switch (ctx.url) {
    case "/": {
      currentPage = "root";
      prefixes = [""];
      break;
    }
    case "/napsack": {
      currentPage = "napSack";
      prefixes = ["", currentPage];
      break;
    }
    case "/atm": {
      currentPage = "atm";
      prefixes = ["", currentPage];
      break;
    }
  }
  controller.runOnServer(set(state`currentPage`, currentPage), {});
  await completeInits(controller, prefixes);

  // Example server-side change.
  await waitForNaps(
    controller,
    [""],
    [controller.module.signals.increase.signal, { value: 6 }],
  );

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
      ${script}
      <script src="dist/bundle.js"></script>`;
});

app.listen(3000);
console.log("Listening on http://localhost:3000");

function completeInits(controller, prefixes) {
  const initSignals = prefixes
    .map(prefix => getModulePath(prefix, "init"))
    .map(getSignal(controller));

  return waitForNaps(controller, prefixes, [initSignals, {}]);
}

function waitForNaps(controller, prefixes, [signal, payload]) {
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
  controller.runOnServer(signal, payload);
  return napsDone;
}
