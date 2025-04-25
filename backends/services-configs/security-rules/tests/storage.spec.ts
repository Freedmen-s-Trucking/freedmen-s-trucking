import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {uploadBytes, getBytes} from "firebase/storage";
import {readFileSync} from "fs";
import {afterAll, beforeAll, beforeEach, describe, it} from "vitest";

const MY_DEV_PROJECT_ID = "id-3333";

let testEnvironment: RulesTestEnvironment;

beforeAll(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: MY_DEV_PROJECT_ID,
    storage: {
      rules: readFileSync(`${__dirname}/../rules/storage.rules`, "utf8"),
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
    // Creates profile binary file of user with id `user_1`.
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      const testdoc = context.storage().ref("users/user_1/profile");
      await uploadBytes(testdoc, new Blob(["test"]));
    });
  }
});

describe("Storage Global rules", () => {
  it("rejects read and write from unauthenticated users.", async function () {
    const unauthedDb = testEnvironment.unauthenticatedContext().storage();

    const testdoc = unauthedDb.ref("users/test");

    await assertFails(getBytes(testdoc));

    await assertFails(uploadBytes(testdoc, new Blob(["test"])));
  });

  it("allows read from authenticated users.", async function () {
    const authedDb = testEnvironment.authenticatedContext("user_2").storage();

    const testdoc = authedDb.ref("users/user_1/profile");

    await assertSucceeds(getBytes(testdoc));
  });

  it("allows write from user's own document.", async function () {
    const authedDb = testEnvironment.authenticatedContext("user_1").storage();

    const testdoc = authedDb.ref("users/user_1/profile");

    await assertSucceeds(uploadBytes(testdoc, new Blob(["test"])));
  });

  it("rejects write from other users different from the owner.", async function () {
    const authedDb = testEnvironment.authenticatedContext("user_2").storage();

    const testdoc = authedDb.ref("users/user_1/profile");

    await assertFails(uploadBytes(testdoc, new Blob(["test"])));
  });
});
