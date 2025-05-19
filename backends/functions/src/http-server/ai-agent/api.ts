import {Hono} from "hono";
import {apiReqExtractOrderRequestFromText, type} from "@freedmen-s-trucking/types";
// import {extractOrderRequestFromText} from "~src/services/ai-agent/extract-order-request-from-text";
import {deliveryOrder, sendMessage} from "~src/services/ai-agent/extract-order-request-assistant/agent-logic";
import {Variables} from "~src/utils/types";
import {trace, SpanStatusCode, context, Exception} from "@opentelemetry/api";
const tracer = trace.getTracer("order-extraction-tracer");
const router = new Hono<{Variables: Variables}>();

router.post("/extract-order-request", async (c) => {
  // Start root span for the request
  return tracer.startActiveSpan("extract-order-request", async (span) => {
    try {
      // Parse and validate input
      const req = await tracer.startActiveSpan("parse-input", async (parseSpan) => {
        try {
          const result = apiReqExtractOrderRequestFromText(await c.req.json());
          if (result instanceof type.errors) {
            parseSpan.setStatus({
              code: SpanStatusCode.ERROR,
              message: "Invalid input",
            });
            parseSpan.recordException(new Error(result.summary));
            return result;
          }
          return result;
        } finally {
          parseSpan.end();
        }
      });

      if (req instanceof type.errors) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Bad request",
        });
        return c.json({error: req.summary}, 400);
      }

      // Process message with AI
      const aiResponse = await tracer.startActiveSpan("ai-processing", async (aiSpan) => {
        try {
          const result = await sendMessage(
            {role: "user", content: req.text, messageId: req.chatId || null},
            {reset: !req.threadId, threadId: c.get("user").uid},
          );

          aiSpan.setAttribute("response.length", result.response?.length || 0);
          return result;
        } catch (error) {
          aiSpan.recordException(error as Exception);
          aiSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: "AI processing failed",
          });
          throw error;
        } finally {
          aiSpan.end();
        }
      });

      const serializedData = await tracer.startActiveSpan("parse-response", async (parseSpan) => {
        try {
          return JSON.parse(aiResponse.response || "{}");
        } catch (error) {
          parseSpan.recordException(error as Exception);
          parseSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Failed to parse AI response",
          });
          throw error;
        } finally {
          parseSpan.end();
        }
      });

      if (serializedData?.onboarding?.status !== "completed") {
        span.setStatus({code: SpanStatusCode.OK});
        return c.json(
          {
            data: {order: {}, onboarding: serializedData.onboarding},
            threadId: aiResponse.threadId,
            chatId: aiResponse.chatId,
          },
          200,
        );
      }

      // Validate order data
      const validation = await tracer.startActiveSpan("validate-order", async (validateSpan) => {
        try {
          return deliveryOrder.get("order")(serializedData?.order || {});
        } catch (error) {
          validateSpan.recordException(error as Exception);
          validateSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: "Validation error",
          });
          throw error;
        } finally {
          validateSpan.end();
        }
      });

      if (validation instanceof type.errors) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "Validation failed",
        });
        console.error("Validation failed", validation.summary);
        return c.json({error: validation.toJSON() as unknown, errorMessage: validation.summary}, 400);
      }

      span.setStatus({code: SpanStatusCode.OK});
      return c.json(
        {
          data: {order: validation, onboarding: serializedData.onboarding},
          threadId: aiResponse.threadId,
          chatId: aiResponse.chatId,
        },
        200,
      );
    } catch (error) {
      span.recordException(error as Exception);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Server error",
      });
      return c.json({error: "Internal server error"}, 500);
    } finally {
      span.end();
    }
  });
});

// router.post("/extract-order-request", async (c) => {
//   const req = apiReqExtractOrderRequestFromText(await c.req.json());
//   if (req instanceof type.errors) {
//     return c.json({error: req.summary}, 400);
//   }
//   // const res = await extractOrderRequestFromText(req.text);
//   const res = await sendMessage(
//     {role: "user", content: req.text, messageId: req.chatId || null},
//     {reset: !req.threadId, threadId: c.get("user").uid},
//   );
//   console.log(res.response);
//   const serializedData: any = JSON.parse(res.response || "{}");
//   if (serializedData?.onboarding?.status !== "completed") {
//     return c.json(
//       {data: {order: {}, onboarding: serializedData.onboarding}, threadId: res.threadId, chatId: res.chatId},
//       200,
//     );
//   }
//   const validation = deliveryOrder.get("order")(serializedData?.order || {});
//   if (validation instanceof type.errors) {
//     console.error("Validation failed", validation.summary);
//     return c.json({error: validation.toJSON() as unknown, errorMessage: validation.summary}, 400);
//   }
//   return c.json(
//     {data: {order: validation, onboarding: serializedData.onboarding}, threadId: res.threadId, chatId: res.chatId},
//     200,
//   );
// });

export default router;
