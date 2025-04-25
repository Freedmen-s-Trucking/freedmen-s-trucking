import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {getDoc, setDoc} from "firebase/firestore";
import {readFileSync} from "fs";
import {afterAll, beforeAll, beforeEach, describe, it} from "vitest";

const MY_DEV_PROJECT_ID = "id-4444";

let testEnvironment: RulesTestEnvironment;

beforeAll(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: MY_DEV_PROJECT_ID,
    firestore: {
      rules: readFileSync(`${__dirname}/../rules/firestore.rules`, "utf8"),
      host: "localhost",
      port: 8080,
    },
  });
  testEnvironment = testEnv;
});

afterAll(async () => {
  if (testEnvironment) {
    await testEnvironment.cleanup();
  }
});

beforeEach(async () => {
  if (testEnvironment) {
    await testEnvironment.clearFirestore();
    // Setup: Create documents in DB for testing (bypassing Security Rules).
    // Creates user with id `user_1`.
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      const testdoc = context.firestore().collection("users").doc("user_1");
      await setDoc(testdoc, {});
    });
    // Creates user with id `user_2`.
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      const testdoc = context.firestore().collection("users").doc("user_2");
      await setDoc(testdoc, {});
    });
  }
});

describe("Users collection rules", () => {
  it("rejects read and write from unauthenticated users.", async function () {
    const unauthedDb = testEnvironment.unauthenticatedContext().firestore();

    const testdoc = unauthedDb.collection("users").doc("user_1");

    await assertFails(getDoc(testdoc));
    await assertFails(setDoc(testdoc, {test: "test1"}));
  });

  it("allows read from authenticated users.", async function () {
    const authedDb = testEnvironment.authenticatedContext("user_1").firestore();

    const testdoc = authedDb.collection("users").doc("user_1");

    await assertSucceeds(getDoc(testdoc));
  });

  it("allows write from user's own document.", async function () {
    const authedDb = testEnvironment.authenticatedContext("user_1").firestore();

    const testdoc = authedDb.collection("users").doc("user_1");

    await assertSucceeds(setDoc(testdoc, {test: "test1"}));
  });

  it("rejects write from other users different from the owner.", async function () {
    const authedDb = testEnvironment.authenticatedContext("user_2").firestore();

    const testdoc = authedDb.collection("users").doc("user_1");

    await assertFails(setDoc(testdoc, {test: "test1"}));
  });

  it("allows read from other authenticated users different from the owner.", async function () {
    const authedDb = testEnvironment.authenticatedContext("user_2").firestore();

    const testdoc = authedDb.collection("users").doc("user_1");

    await assertSucceeds(getDoc(testdoc));
  });
});
