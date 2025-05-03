import {ApiResExtractOrderRequestFromTextSchema} from "@freedmen-s-trucking/types";
import {openAiClient} from "./config";
import {systemPrompt} from "./instructions";

export const extractOrderRequestFromText = async (text: string) => {
  const response = await openAiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {role: "developer", content: systemPrompt},
      {role: "user", content: text},
    ],
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "OrderRequest",
        description: "Order request details",
        // strict: true,
        schema: ApiResExtractOrderRequestFromTextSchema as Record<string, unknown>,
      },
    },
  });
  return response.choices[0].message.content;
};
