/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 *
 * Start writing functions
 * https://firebase.google.com/docs/functions/typescript
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { Hono } from "hono";
import { getRequestListener } from "@hono/node-server";
const app = new Hono();

app.get("/v1/hello", (c) => {
  logger.info("Hello logs!", {UnStructured: null});
  return c.text("Hono!")
});

app.notFound((c) => {
  return c.text('404 Not Found', 404)
})

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Custom Error Message', 500)
})

export default onRequest(getRequestListener(app.fetch));
