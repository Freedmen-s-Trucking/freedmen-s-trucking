import OpenAI from "openai";
import {ENV_OPENAI_API_KEY} from "~src/utils/envs";

export const openAiClient = new OpenAI({
  apiKey: ENV_OPENAI_API_KEY,
});
