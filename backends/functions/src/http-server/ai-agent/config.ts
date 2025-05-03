import OpenAI from "openai";
import {OPENAI_API_KEY} from "~src/utils/envs";

export const openAiClient = new OpenAI({
  apiKey: OPENAI_API_KEY,
});
