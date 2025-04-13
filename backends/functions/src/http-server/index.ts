import { getRequestListener } from '@hono/node-server';
import { onRequest } from 'firebase-functions/v2/https';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import stripeApiRouter from './stripe/api';

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

const apiV1Route = new Hono();
apiV1Route.use(logger(customLogger));
apiV1Route.use(secureHeaders());
apiV1Route.route('/stripe', stripeApiRouter);

apiV1Route.notFound((c) => {
  return c.json({ error: '404 Not Found' }, 404);
});

apiV1Route.onError((err, c) => {
  console.error(`${err}`, err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const app = new Hono();
app.route('/api/v1', apiV1Route);

export const httpServer = onRequest(
  {
    timeoutSeconds: 10,
  },
  getRequestListener(app.fetch),
);
