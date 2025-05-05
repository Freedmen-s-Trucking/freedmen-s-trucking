import {getRequestListener} from "@hono/node-server";
import {onRequest} from "firebase-functions/v2/https";
import {Hono} from "hono";
import {logger} from "hono/logger";
import {secureHeaders} from "hono/secure-headers";
import stripeApiRouter from "./stripe/api";
import aiAgentApiRouter from "./ai-agent/api";
import authenticateApiRouter from "./authenticate/api";
import orderApiRouter from "./order/api";
import userApiRouter from "./user/api";
import {bearerAuth} from "hono/bearer-auth";
import {getAuth} from "firebase-admin/auth";
import {Variables} from "../utils/types";

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

const apiV1Route = new Hono<{Variables: Variables}>();
apiV1Route.use(logger(customLogger));
apiV1Route.use(secureHeaders());
apiV1Route.use(async (c, next) => {
  console.log({reqPath: c.req.path});
  // Skip bearer auth for stripe webhook
  if (c.req.path.endsWith("/stripe/webhook")) {
    await next();
  } else {
    await bearerAuth({
      verifyToken: async (token, c) => {
        const auth = getAuth();
        try {
          const idTokenResult = await auth.verifyIdToken(token);
          c.set("user", idTokenResult);
          return true;
        } catch (error) {
          return false;
        }
      },
    })(c, next);
  }
});
apiV1Route.route("/stripe", stripeApiRouter);
apiV1Route.route("/ai-agent", aiAgentApiRouter);
apiV1Route.route("/authenticate", authenticateApiRouter);
apiV1Route.route("/order", orderApiRouter);
apiV1Route.route("/user", userApiRouter);

apiV1Route.notFound((c) => {
  return c.json({error: "404 Not Found"}, 404);
});

apiV1Route.onError((err, c) => {
  console.error(`${err}`, err);
  return c.json({error: "Internal Server Error"}, 500);
});

const app = new Hono();
app.route("/api/v1", apiV1Route);

export const httpServer = onRequest(
  {
    timeoutSeconds: 20,
  },
  getRequestListener(app.fetch),
);
