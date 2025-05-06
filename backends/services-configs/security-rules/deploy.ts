import admin from "firebase-admin";
import fs from "fs";

admin.initializeApp();

// Publish firestore rules
const rawFirestoreRules = fs.readFileSync(
  `${__dirname}/rules/firestore.rules`,
  "utf8",
);

const firestoreReleaseTask = admin
  .securityRules()
  .releaseFirestoreRulesetFromSource(rawFirestoreRules);

// Publish storage rules
const rawStorageRules = fs.readFileSync(
  `${__dirname}/rules/storage.rules`,
  "utf8",
);

const projectId = admin.app().options.projectId;
if (!projectId) {
  throw new Error("Could not determine project ID");
}

const storageReleaseTask = admin
  .securityRules()
  .releaseStorageRulesetFromSource(rawStorageRules, `${projectId}.appspot.com`);

// Wait for both releases to complete
try {
  await Promise.all([firestoreReleaseTask, storageReleaseTask]);
  console.log("Security rules deployed successfully");
  process.exit(0);
} catch (error) {
  console.error("Failed to deploy security rules");
  console.error(error);
  process.exit(1);
}
