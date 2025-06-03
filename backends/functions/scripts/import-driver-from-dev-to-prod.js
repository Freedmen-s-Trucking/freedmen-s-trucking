const admin = require("firebase-admin");
const fs = require("fs");

// Load credentials
const stagingApp = admin.initializeApp(
  {
    credential: admin.credential.cert(require("./staging-service-account.json")),
  },
  "staging",
);

const prodApp = admin.initializeApp(
  {
    credential: admin.credential.cert(require("./prod-service-account.json")),
  },
  "prod",
);

const stagingDb = stagingApp.firestore();
const stagingAuth = stagingApp.auth();
const stagingStorage = admin.storage();

const prodDb = prodApp.firestore();
const prodAuth = prodApp.auth();
const prodStorage = admin.storage();

// Hash options (must match staging project's settings)
const hashOptions = {
  algorithm: "SCRYPT",
  // Example values (you must update with real ones from staging config)
  key: Buffer.from("base64-encoded-scrypt-key", "base64"),
  saltSeparator: Buffer.from(""),
  rounds: 8,
  memoryCost: 14,
};

async function migrateDriversAndAuth() {
  const driverDocs = await stagingDb.collection("drivers").listDocuments();

  console.log(`Found ${driverDocs.length} driver(s) in staging.`);

  const importBatch = [];

  for (const docRef of driverDocs) {
    const uid = docRef.id;
    const driverDoc = await docRef.get();
    if (!driverDoc.exists) continue;

    // Check if auth user exists in staging
    let stagingUser;
    try {
      stagingUser = await stagingAuth.getUser(uid);
    } catch {
      console.warn(`⚠️ No auth user for UID: ${uid}`);
      continue;
    }

    // Ignore anonymous users
    if (stagingUser.providerData.length === 0) {
      console.log(`Skipping anonymous user: ${uid}`);
      continue;
    }

    // Check if user already exists in prod
    let userExists = false;
    try {
      await prodAuth.getUser(uid);
      console.log(`User ${uid} already exists in prod`);
      userExists = true;
    } catch (err) {
      if (err.code !== "auth/user-not-found") {
        console.error(`Error checking prod user ${uid}:`, err);
        continue;
      }
    }

    if (!userExists) {
      // Collect user for import
      const customClaims = stagingUser.customClaims || {};

      const userImportRecord = {
        uid: stagingUser.uid,
        email: stagingUser.email,
        emailVerified: stagingUser.emailVerified,
        displayName: stagingUser.displayName,
        photoURL: stagingUser.photoURL,
        disabled: stagingUser.disabled,
        passwordHash: stagingUser.passwordHash,
        passwordSalt: stagingUser.passwordSalt,
        customClaims,
      };

      importBatch.push(userImportRecord);
    }

    // Migrate Firestore doc
    try {
      await prodDb.doc(`drivers/${uid}`).set({...driverDoc.data(), imported: true}, {merge: true});
      const stagingUserDoc = await stagingDb.doc(`users/${uid}`).get();
      if (!stagingUserDoc.exists) continue;
      await prodDb.doc(`users/${uid}`).set({...stagingUserDoc.data(), imported: true}, {merge: true});
      console.log(`✅ Migrated driver doc: ${uid}`);
    } catch (err) {
      console.error(`❌ Failed to import Firestore doc for ${uid}:`, err);
    }
  }

  // Import users to prod auth
  if (importBatch.length > 0) {
    try {
      const result = await prodAuth.importUsers(importBatch, {hash: hashOptions});
      console.log(`✅ Imported ${result.successCount} user(s), ${result.failureCount} failed`);
      result.errors.forEach((err) => {
        console.error(`Error importing user[${err.index}]: ${err.error.message}`);
      });
    } catch (err) {
      console.error("❌ Failed to import users:", err);
    }
  } else {
    console.log("No users to import.");
  }

  console.log("🚀 Migration complete.");
}

migrateDriversAndAuth().catch(console.error);
