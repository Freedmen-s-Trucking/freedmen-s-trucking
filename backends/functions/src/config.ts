import admin from "firebase-admin";
import * as app from "firebase-admin/app";
import {slackNotify} from "./utils/slack-notification";

if (!admin.apps.length) {
  app.initializeApp();
}

const defaultConsole = {...console};
global.console = {
  ...defaultConsole,
  log: (message: any, ...optionalParams: any[]) => {
    defaultConsole.log(message, ...optionalParams);
  },
  error: async (message: any, ...optionalParams: any[]) => {
    defaultConsole.error(message, ...optionalParams);
    await slackNotify("backend", message, ...optionalParams);
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
