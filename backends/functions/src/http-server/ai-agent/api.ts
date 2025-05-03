import {Hono} from "hono";
import {apiReqExtractOrderRequestFromText, type} from "@freedmen-s-trucking/types";
import {extractOrderRequestFromText} from "./agent";

const router = new Hono();

router.post("/extract-order-request", async (c) => {
  const req = apiReqExtractOrderRequestFromText(await c.req.json());
  if (req instanceof type.errors) {
    return c.json({error: req.summary}, 400);
  }
  const res = await extractOrderRequestFromText(req.text);
  return c.text(res || "null", 200, {"Content-Type": "application/json"});
});

export default router;
