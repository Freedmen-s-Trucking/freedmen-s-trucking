import {apiResExtractOrderRequestFromText} from "@freedmen-s-trucking/types";
import {openAiClient} from "./config";

const ApiResExtractOrderRequestFromTextSchema = apiResExtractOrderRequestFromText.toJsonSchema();
export const extractOrderRequestFromText = async (text: string) => {
  const response = await openAiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {role: "developer", content: orderDataExtractionSystemPrompt},
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

const orderDataExtractionSystemPrompt = `
You are an intelligent assistant for a delivery service platform. 
Your job is to extract structured delivery information from a natural language request provided by a client. 
Clients describe their delivery using informal text, and you must identify and structure all relevant data. 
Packages may contain multiple items of different types (e.g., "5 TVs and 2 sofas").

Your tasks:

1. Identify the pickup and dropoff locations.
2. Extract the list of package items, each with:
   - Name (e.g., TV, sofa)
   - Quantity (e.g., 2)
   - Estimated dimensions (length, width, height in inches)
   - Estimated weight (in lbs)
   Use common shipping standards for typical consumer goods to estimate size and weight.
3. Calculate the **total package volume** (sum of volumes of all items) and **total weight**.
4. Determine the urgency level:
   - 'high' if the message includes a delivery time or urgency like "ASAP", "urgent", "before 3pm"
   - 'medium' for vague urgency terms like "soon", "quick"
   - 'low' if no urgency is mentioned
5. Extract the specific delivery time mentioned if present.

Respond in the following JSON format:
${JSON.stringify(ApiResExtractOrderRequestFromTextSchema)}
`;
