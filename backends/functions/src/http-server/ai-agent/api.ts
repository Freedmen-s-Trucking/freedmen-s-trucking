import {Hono} from "hono";
import {apiReqExtractOrderRequestFromText, type} from "@freedmen-s-trucking/types";
// import {extractOrderRequestFromText} from "~src/services/ai-agent/extract-order-request-from-text";
import {deliveryOrder, sendMessage} from "~src/services/ai-agent/extract-order-request-assistant/agent-logic";
import {Variables} from "~src/utils/types";
import {trace, SpanStatusCode, context} from "@opentelemetry/api";

const tracer = trace.getTracer("order-tracer");

const router = new Hono<{Variables: Variables}>();

router.post("/extract-order-request", async (c) => {
  const req = apiReqExtractOrderRequestFromText(await c.req.json());
  if (req instanceof type.errors) {
    return c.json({error: req.summary}, 400);
  }
  // const res = await extractOrderRequestFromText(req.text);
  const res = await sendMessage(
    {role: "user", content: req.text, messageId: req.chatId || null},
    {reset: !req.threadId, threadId: c.get("user").uid},
  );
  console.log(res.response);
  const serializedData: any = JSON.parse(res.response || "{}");
  if (serializedData?.onboarding?.status !== "completed") {
    return c.json(
      {data: {order: {}, onboarding: serializedData.onboarding}, threadId: res.threadId, chatId: res.chatId},
      200,
    );
  }
  const validation = deliveryOrder.get("order")(serializedData?.order || {});
  if (validation instanceof type.errors) {
    console.error("Validation failed", validation.summary);
    return c.json({error: validation.toJSON() as unknown, errorMessage: validation.summary}, 400);
  }
  return c.json(
    {data: {order: validation, onboarding: serializedData.onboarding}, threadId: res.threadId, chatId: res.chatId},
    200,
  );
});

export default router;
