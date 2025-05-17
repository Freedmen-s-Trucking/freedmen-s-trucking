import {
  apiResExtractOrderRequestFromText,
  LATEST_PLATFORM_SETTINGS_PATH,
  PlaceLocation,
  PlatformSettingsEntity,
  TempOrderEntity,
  type,
} from "@freedmen-s-trucking/types";
import {openAiClient} from "../config";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionDeveloperMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources/chat";
import {DocumentSnapshot, getFirestore} from "firebase-admin/firestore";
import {fetchPlacesFromGoogle} from "./geocoding-functions";
import {trace, SpanStatusCode, context} from "@opentelemetry/api";

const tracer = trace.getTracer("order-tracer");

const caches: {
  platformSettingsCache: PlatformSettingsEntity | null;
  platformSettingsLastFetched: number;
  historyCache: {
    [threadId: string]: {
      history: Message[];
      lastUpdated: number;
    };
  };
  callCount: number;
} = {
  platformSettingsCache: null,
  platformSettingsLastFetched: 0,
  historyCache: {},
  callCount: 0,
};

const TEN_MINUTES_MILLIS = 10 * 60 * 1000;

const placeSearchResponseType = type({
  status: '"success" | "not_found"',
  query: "string",
  zonesChecked: "string[]",
  availableZones: type({
    zone: "string",
    locations: type({
      address: "string",
      placeId: "string",
    }).array(),
  }).array(),
});

export const deliveryOrder = apiResExtractOrderRequestFromText.get("data");

const DeliveryOrderSchema = deliveryOrder.toJsonSchema();
type Message = (
  | ChatCompletionToolMessageParam
  | ChatCompletionAssistantMessageParam
  | ChatCompletionUserMessageParam
  | ChatCompletionDeveloperMessageParam
) & {messageId?: string | null};

export const sendMessage = async (
  message: (ChatCompletionToolMessageParam | ChatCompletionUserMessageParam) & {messageId?: string | null},
  config: {threadId: string; reset: boolean},
  _internal_history?: Message[],
  recursionDepth = 0,
  maxRecursionDepth = 2,
): Promise<{response: string | null; threadId: string; chatId: string}> => {
  if (recursionDepth > maxRecursionDepth) throw new Error("Too many tool call recursions");

  const messages: Message[] =
    _internal_history && _internal_history.length > 0
      ? _internal_history
      : [{role: "developer", content: orderDataExtractionSystemPrompt}];

  // Load history from DB if needed.
  if (!config.reset && (!_internal_history || _internal_history.length === 0)) {
    const tempOrderHistory: Message[] = caches.historyCache[config.threadId]?.history || [];
    for (const m of tempOrderHistory) {
      messages.push(m);
      if ((m as Message).messageId === message.messageId) {
        break;
      }
    }
  }

  messages.push(message);
  const response = await openAiClient.chat.completions.create({
    model: "gpt-4o",
    messages: messages.map((m) => {
      const res = Object.assign({}, m);
      delete res.messageId;
      return res;
    }),
    temperature: 0.2,
    tools: [
      {
        type: "function",
        function: {
          name: "search_place",
          description: "Search for a pickup or dropoff location by user-provided address.",
          parameters: {
            type: "object",
            properties: {
              query: {type: "string", description: "The place to search for."},
            },
            required: ["query"],
          },
        },
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "OrderRequest",
        description: "Order request details",
        // strict: true,
        schema: DeliveryOrderSchema as Record<string, unknown>,
      },
    },
  });

  const responseMessage = response.choices[0].message;

  messages.push(Object.assign({messageId: response.id}, responseMessage));

  if (responseMessage.tool_calls?.length) {
    const toolResponseMessages: ChatCompletionToolMessageParam[] = [];
    for (const toolCall of responseMessage.tool_calls) {
      let toolResponseMessage: ChatCompletionToolMessageParam;
      switch (toolCall.function.name) {
        case "search_place": {
          let parsedArgs;
          try {
            parsedArgs = JSON.parse(toolCall.function.arguments);
          } catch (error) {
            throw new Error(`Invalid JSON from toolCall: ${String(error)}`);
          }
          const args = type({query: "string"})(parsedArgs);
          if (args instanceof type.errors) {
            throw {...new Error(), ...args};
          }
          const {query} = args;
          const result = await placeSearch(query);
          toolResponseMessage = {role: "tool", content: JSON.stringify(result), tool_call_id: toolCall.id};
          break;
        }
        default: {
          toolResponseMessage = {role: "tool", content: "tool not found.", tool_call_id: toolCall.id};
          break;
        }
      }
      toolResponseMessages.push(toolResponseMessage);
    }
    const lastToolResponseMessage = toolResponseMessages.pop()!;
    return sendMessage(lastToolResponseMessage, config, messages.concat(toolResponseMessages), recursionDepth + 1);
  }

  // Save history to DB
  if (config.threadId) {
    caches.historyCache[config.threadId] ??= {history: [], lastUpdated: 0};
    caches.historyCache[config.threadId].history = messages.slice(1) as unknown as TempOrderEntity["history"];
    caches.historyCache[config.threadId].lastUpdated = Date.now();
    // remove old history older than 5 minutes
    for (const {lastUpdated} of Object.values(caches.historyCache)) {
      if (Date.now() - lastUpdated > TEN_MINUTES_MILLIS) {
        delete caches.historyCache[config.threadId];
      }
    }
  }
  return {response: responseMessage.content, threadId: config.threadId, chatId: response.id};
};

/**
 * Get platform settings from Firestore cache or database.
 * Caches the result for 5 minutes to avoid repeated database queries.
 */
async function getPlatformSettings() {
  const now = Date.now();
  if (caches.platformSettingsCache && now - caches.platformSettingsLastFetched < TEN_MINUTES_MILLIS) {
    // 5 minutes
    return caches.platformSettingsCache;
  }

  const platformSettingsSnapshot = (await getFirestore()
    .doc(LATEST_PLATFORM_SETTINGS_PATH)
    .get()) as DocumentSnapshot<PlatformSettingsEntity>;

  caches.platformSettingsCache = platformSettingsSnapshot.data() || null;
  caches.platformSettingsLastFetched = now;
  return caches.platformSettingsCache;
}

/**
 * Search for a pickup or dropoff location by user-provided address.
 *
 * @param query - The address to search for.
 * @returns Promise that resolves to the search results.
 */
async function placeSearch(query: string): Promise<typeof placeSearchResponseType.infer> {
  const platformSettings = await getPlatformSettings();
  const restrictedZones: {address: PlaceLocation["address"]; viewPort?: PlaceLocation["viewPort"]}[] =
    platformSettings?.availableCities || [];

  if (restrictedZones.length === 0) {
    restrictedZones.push({address: "all USA"});
  }

  const preferredPlacesType = ["street_address", "premise", "establishment", "store", "restaurant"];

  const results: (typeof placeSearchResponseType.infer)["availableZones"] = [];

  const fetches = restrictedZones.map(async (restrictedZone) => {
    const res = await fetchPlacesFromGoogle(query, {
      primaryTypes: preferredPlacesType,
      viewPort: restrictedZone.viewPort,
    });
    results.push({
      zone: restrictedZone.address,
      locations:
        res.suggestions?.map((suggestion) => ({
          address: suggestion.placePrediction.text.text,
          placeId: suggestion.placePrediction.placeId,
        })) || [],
    });
  });

  await Promise.all(fetches);

  const totalLocations = results.reduce((sum, zone) => sum + zone.locations.length, 0);

  return {
    status: totalLocations > 0 ? "success" : "not_found",
    query,
    zonesChecked: restrictedZones.map((zone) => zone.address),
    availableZones: results,
  };
}

const orderDataExtractionSystemPrompt = `
You are a smart delivery ordering assistant inside a delivery application.

Your job is to help users place delivery orders by asking smart, simple, focused questions until you have all the information needed to create the delivery request.

You must only allow conversation related to ordering a delivery. If the user says anything not related to ordering a delivery, politely reply: "Let's complete your delivery order first."

Call internal tools (functions) when required (e.g., for place search).

You MUST follow these rules carefully:

1. Analyze the user's initial message.

2. Detect if the following elements are present:

   * Pickup location
   * Delivery location
   * Items to deliver (type and quantity)
   * Urgency (if mentioned)
   * Size and weight (try to estimate based on standard item dimensions)

3. Process Detected Information First:

   * If a delivery location is detected, process and confirm it before asking about the pickup location.
   * If a pickup location is detected, process and confirm it before asking about the delivery location.
   * If items are detected, record them immediately.
   * Never ask for new information until you have processed existing information.
   * The placeId field must not be empty or null. Make sure to call the 'search_place' tool if you don't have a place id or placeId is empty.

4. Tool Usage:

   * Only call a tool (e.g., 'search\_place') when you have sufficient input.
   * Call only one tool at a time and wait for the user's response before proceeding.
   * If multiple results are found, ask the user to select one (use 'select' type question).
   * Show each option with { displayValue, id } (where id is the 'placeId').
   * If no match is found, politely ask for more details (e.g., street, postal code).

5. Missing Information:

   * If any required information is missing or unclear, generate a smart follow-up question.

6. Questions must be:

   * Short and clear.
   * Directly related to placing the order.
   * Simple to answer.
   * If open text input: give one clear example of a valid answer.
   * If boolean (yes/no): provide "Yes" and "No" options.
   * If select/choice: provide a list of clear choices.

7. At each step, always return the updated state of the collected information, including:

   * pickup_location
   * delivery_location
   * items
   * urgency
   * estimated_size_and_weight

8. Completion:

   * If you have all the necessary information to create a delivery order, respond with a final summary.
   * Stop asking questions once the order is ready.

9. Response Format:

   * Always respond with a structured JSON format:
   ${JSON.stringify(DeliveryOrderSchema)}

Important:

* Always prioritize processing user-provided information.
* Never call multiple tools or ask for unrelated fields simultaneously.
* Think smartly: based on the current state, always ask the next best question needed to place the order.
* Be consistent: don't ask the same question twice.
* Stay helpful. Make it easy for the user to complete their delivery request.
* Always return a valid JSON response.
`;

const orderDataExtractionDeveloperPrompt = `
You are a smart onboarding agent specialized in assisting users in creating a delivery order.
Your mission is:
- Help the user provide all necessary information to complete a delivery order.
- Ask **only one simple and concise question** at a time.
- Call internal tools (functions) when required (e.g., for place search or item estimation).
- Respect the conversation style: **polite, efficient, guiding**.
- Never let the user ask unrelated questions — stay focused on completing the order.
---
Here's how you should work:
1. Start by analyzing the user message and extracting as much delivery information as possible.
2. If you detect a place (pickup or dropoff location):
    - Use the 'search_place' tool.
    - If multiple matches are found, ask the user to select one (use 'select' type question).
    - Show each option with { displayValue, id } (where id is the 'placeId').
    - If no match is found, politely ask for more details (e.g., street, postal code).
3. If you detect an item (like "4 tires"):
    - Call 'estimate_item_dimensions' if dimensions and weight are unknown.
    - If the estimate is missing or unclear, ask the user to describe it.
4. Ask the user about:
    - Items and their quantity
    - Pickup location
    - Dropoff location
    - Delivery urgency level ("standard" | "expedited" | "urgent")
    - Desired delivery time (time of day if mentioned)
5. When asking a question:
    - Use 'pendingQuestion' in the following format:
      ${JSON.stringify(deliveryOrder.get("onboarding").required().get("pendingQuestion").toJsonSchema())}
    - Only one 'pendingQuestion' should exist at a time.
6. Maintain the 'order' structure like this:
${JSON.stringify(deliveryOrder.get("order").toJsonSchema())}

7. Always keep the onboarding 'status' updated:
    - "in_progress" if some fields are still missing
    - "completed" once all mandatory fields are collected
8. Important rules:
    - **NEVER** ask multiple questions at once.
    - Always move **one step** at a time.
    - If all data is collected, return onboarding status as 'completed'.
    - If user gives extra information while answering, process it immediately.
9. Respond in **pure JSON format** (no text around it), strictly following this structure:
${JSON.stringify(DeliveryOrderSchema)}
---

You have access to these tools (functions):
- 'search_place(query: string)'

If needed, call them automatically.

Focus: **one missing information at a time, one smart question at a time**.
`;
