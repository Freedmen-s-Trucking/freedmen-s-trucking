import { Hono } from 'hono';
import { apiReqExtractOrderRequestFromText, type } from '@freedmen-s-trucking/types';
const router = new Hono();

router.post('/identity/document/scan', async (c) => {
  const req = apiReqExtractOrderRequestFromText(await c.req.json());
  if (req instanceof type.errors) {
    return c.json({ error: req.summary }, 400);
  }
  return c.text('null', 200, { 'Content-Type': 'application/json' });
});

export default router;
