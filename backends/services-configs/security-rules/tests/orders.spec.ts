import {setDoc, getDoc} from "firebase/firestore";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {readFileSync} from "fs";
import {beforeAll, afterAll, beforeEach, describe, it} from "vitest";

const MY_DEV_PROJECT_ID = "id-3333";

let testEnvironment: RulesTestEnvironment;

beforeAll(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: MY_DEV_PROJECT_ID,
    firestore: {
      rules: readFileSync(`${__dirname}/../rules/firestore.rules`, "utf8"),
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
    // Creates new order in the database.
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      const testdoc = context.firestore().collection("orders").doc("order_1");
      await setDoc(testdoc, {assignedDriverIds: ["user_1", "user_2"]});
    });
  }
});

describe("Orders collection rules", () => {
  it("rejects read and write from unregistered users.", async function () {
    const unauthedDb = testEnvironment.unauthenticatedContext().firestore();

    const testdoc = unauthedDb.collection("orders").doc("order_1");

    await assertFails(Promise.all([getDoc(testdoc), setDoc(testdoc, {test: "test1"})]));
  });

  it("allows read authenticated users.", async function () {
    const authedDb = testEnvironment.authenticatedContext("user_1").firestore();

    const testdoc = authedDb.collection("orders").doc("order_1");

    await assertSucceeds(getDoc(testdoc));
  });

  it("rejects create from any users.", async function () {
    const authedDbUser1 = testEnvironment
      .authenticatedContext("user_1")
      .firestore();
    const authedDbUnknown = testEnvironment
      .unauthenticatedContext()
      .firestore();

    await assertFails(
      setDoc(authedDbUser1.collection("orders").doc("order_x"), {
        test: "test1",
      }),
    );
    await assertFails(
      setDoc(authedDbUnknown.collection("orders").doc("order_x"), {
        test: "test1",
      }),
    );
  });

  it("allows write of own task object only, from driver with assigned task.", async function () {
    const authedDb = testEnvironment.authenticatedContext("user_1").firestore();

    const testdoc = authedDb.collection("orders").doc("order_1");

    await assertSucceeds(
      setDoc(testdoc, {"task-user_1": {key: "test1"}}, {merge: true}),
    );
    await assertFails(
      setDoc(
        testdoc,
        {
          "task-user_1": {key: "test1"},
          "task-user_2": {key: "test1"},
        },
        {merge: true},
      ),
    );
  });

  it("rejects write from other drivers or authenticated users.", async function () {
    const authedDb = testEnvironment.authenticatedContext("user_x").firestore();

    const testdoc = authedDb.collection("orders").doc("order_1");

    await assertFails(setDoc(testdoc, {user_2: {key: "test1"}}));
  });

  // TODO: Add order status change tests.
});
