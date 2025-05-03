import admin from "firebase-admin";
import * as app from "firebase-admin/app";
import {isResponseError, up} from "up-fetch";

if (!admin.apps.length) {
  app.initializeApp();
}

const defaultConsole = {...console};
const SLACK_ALERT_CHANNEL_WEBHOOK_URL = process.env.SLACK_ALERT_CHANNEL_WEBHOOK_URL;
const postSlackMessage = up(fetch, () => ({
  baseUrl: SLACK_ALERT_CHANNEL_WEBHOOK_URL, // 'https://webhook.site/8ca9bde8-26c9-47b8-beca-1afa752b5e87', //
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
}));

global.console = {
  ...defaultConsole,
  log: (message: any, ...optionalParams: any[]) => {
    defaultConsole.log(message, ...optionalParams);
  },
  error: async (message: any, ...optionalParams: any[]) => {
    defaultConsole.error(message, ...optionalParams);

    let prettyParams = JSON.stringify(optionalParams, null, 2);
    // Remove quotes around property names (basic safe version)
    prettyParams = prettyParams.replace(/"([^"]+)":/g, "$1:");

    const formattedParamsStr = optionalParams.length > 0 ? `*Params:* \`\`\`${prettyParams}\`\`\`` : "";
    const stack = ((message as Error).stack || new Error().stack)?.split("\n").slice(1, 10).join("\n");
    const formattedStack = `*Stack:* \`\`\`${stack}\`\`\``;
    const title = "🚨 *Error Caught in Cloud Function* 🚨";
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
            defaultConsole.error("post slack message error:", {
              resData: error.data,
            });
          }
        },
      });
      defaultConsole.log("Slack message sent:", res);
    } catch (sendError) {
      defaultConsole.error("Failed to send Slack message:", sendError);
    }
  },
  warn: (message: any, ...optionalParams: any[]) => {
    defaultConsole.warn(message, ...optionalParams);
  },
  info: (message: any, ...optionalParams: any[]) => {
    defaultConsole.info(message, ...optionalParams);
  },
  debug: (message: any, ...optionalParams: any[]) => {
    defaultConsole.debug(message, ...optionalParams);
  },
};
