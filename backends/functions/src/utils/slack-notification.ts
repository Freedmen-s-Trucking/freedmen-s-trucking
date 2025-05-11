import {isResponseError} from "up-fetch";
import {up} from "up-fetch";

const SLACK_ALERT_CHANNEL_WEBHOOK_URL = process.env.SLACK_ALERT_CHANNEL_WEBHOOK_URL;
const postSlackMessage = up(fetch, () => ({
  baseUrl: SLACK_ALERT_CHANNEL_WEBHOOK_URL, // 'https://webhook.site/8ca9bde8-26c9-47b8-beca-1afa752b5e87', //
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
}));

export async function slackNotify(type: "frontend" | "backend", message: any, ...optionalParams: any[]) {
  if (optionalParams.length === 0 && typeof message === "object") {
    optionalParams.push(message);
  }

  let prettyParams = JSON.stringify(optionalParams, null, 2);
  // Remove quotes around property names (basic safe version)
  prettyParams = prettyParams.replace(/"([^"]+)":/g, "$1:");

  const formattedParamsStr = optionalParams.length > 0 ? `*Params:* \`\`\`${prettyParams}\`\`\`` : "";
  const stack = (
    (message as Error)?.stack ||
    (message as {error?: Error})?.error?.stack ||
    (optionalParams[0] as Error)?.stack ||
    (optionalParams[0] as {error?: Error})?.error?.stack ||
    new Error().stack
  )
    ?.split(/\n\s+at /)
    .slice(1, 10)
    .join("\nat ");
  const formattedStack = `*Stack:* \`\`\`${stack}\`\`\``;
  const title = `🚨 *Error Caught in ${type === "frontend" ? "Frontend WebApp" : "Cloud Function"}* 🚨`;
  const slackMessage = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${title}\n${message}\n${formattedParamsStr}\n${formattedStack}`.substring(0, 3000),
        },
      },
    ],
  };
  try {
    const res = await postSlackMessage("", {
      body: slackMessage,
      onError(error) {
        if (isResponseError(error)) {
          console.warn("post slack message error:", {
            resData: error.data,
          });
        }
      },
    });
    console.log("Slack message sent:", res);
  } catch (sendError) {
    console.warn("Failed to send Slack message:", sendError);
  }
}
