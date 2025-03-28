import admin from "firebase-admin";
import * as app from "firebase-admin/app";

if (!admin.apps.length) {
  app.initializeApp();
}
