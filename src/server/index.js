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
import { getModulePath, getSignal } from "../universal/util";

const app = new Koa();

app.use(serve("./static"));

app.use(async ctx => {
  const controller = UniversalController(module, { allowMultipleRuns: true });

  await completeInits(controller, ["", "napSack"]);

  // Example server-side change.
  const napsDone = waitForNaps(controller, [""]);
  controller.run(controller.module.signals.increase.signal, { value: 7 });
  await napsDone;

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

function completeInits(controller, prefixes = []) {
  const napsDone = waitForNaps(controller, prefixes);

  const initSignals = prefixes
    .map(prefix => getModulePath(prefix, "init"))
    .map(getSignal(controller));
  controller.run(initSignals, {});

  return napsDone;
}

function waitForNaps(controller, prefixes = []) {
  return Promise.all(
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
}
