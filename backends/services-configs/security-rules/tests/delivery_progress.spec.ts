// import {
//   assertFails,
//   assertSucceeds,
//   initializeTestEnvironment,
//   RulesTestEnvironment,
// } from "@firebase/rules-unit-testing";
// import {getDoc, setDoc} from "firebase/firestore";
// import {readFileSync} from "fs";
// import {afterAll, beforeAll, beforeEach, describe, it} from "vitest";

// const MY_DEV_PROJECT_ID = "id-3333";

// let testEnvironment: RulesTestEnvironment;

// beforeAll(async () => {
//   const testEnv = await initializeTestEnvironment({
//     projectId: MY_DEV_PROJECT_ID,
//     firestore: {
//       rules: readFileSync(`${__dirname}/../rules/firestore.rules`, "utf8"),
//       host: "localhost",
//       port: 8080,
//     },
//   });
//   testEnvironment = testEnv;
// });

// afterAll(async () => {
//   if (testEnvironment) {
//     await testEnvironment.cleanup();
//   }
// });

// beforeEach(async () => {
//   if (testEnvironment) {
//     await testEnvironment.clearFirestore();
//     // Setup: Create documents in DB for testing (bypassing Security Rules).
//     // Creates user with id `user_1`.
//     await testEnvironment.withSecurityRulesDisabled(async (context) => {
//       const testdoc = context.firestore().collection("users").doc("user_1");
//       await setDoc(testdoc, {});
//     });
//     // Creates user with id `user_2`.
//     await testEnvironment.withSecurityRulesDisabled(async (context) => {
//       const testdoc = context.firestore().collection("users").doc("user_2");
//       await setDoc(testdoc, {});
//     });
//     // Creates driver with id `user_1`.
//     await testEnvironment.withSecurityRulesDisabled(async (context) => {
//       const testdoc = context.firestore().collection("drivers").doc("user_1");
//       await setDoc(testdoc, {});
//     });
//     // Creates driver with id `user_2`.
//     await testEnvironment.withSecurityRulesDisabled(async (context) => {
//       const testdoc = context.firestore().collection("drivers").doc("user_2");
//       await setDoc(testdoc, {});
//     });
//     // Creates ordersForDelivery for driver with id `user_1`.
//     await testEnvironment.withSecurityRulesDisabled(async (context) => {
//       const testdoc = context
//         .firestore()
//         .collection("drivers")
//         .doc("user_1")
//         .collection("ordersForDelivery")
//         .doc("xyz");
//       await setDoc(testdoc, {});
//     });
//     // Creates ordersForDelivery for driver with id `user_2`.
//     await testEnvironment.withSecurityRulesDisabled(async (context) => {
//       const testdoc = context
//         .firestore()
//         .collection("drivers")
//         .doc("user_2")
//         .collection("ordersForDelivery")
//         .doc("xyz");
//       await setDoc(testdoc, {});
//     });
//     // Creates deliveryProgress for driver with id `user_1`.
//     await testEnvironment.withSecurityRulesDisabled(async (context) => {
//       const testdoc = context
//         .firestore()
//         .collection("drivers")
//         .doc("user_1")
//         .collection("ordersForDelivery")
//         .doc("xyz")
//         .collection("deliveryProgress")
//         .doc("progress_1");
//       await setDoc(testdoc, {});
//     });
//     // Creates deliveryProgress for driver with id `user_2`.
//     await testEnvironment.withSecurityRulesDisabled(async (context) => {
//       const testdoc = context
//         .firestore()
//         .collection("drivers")
//         .doc("user_2")
//         .collection("ordersForDelivery")
//         .doc("xyz")
//         .collection("deliveryProgress")
//         .doc("progress_1");
//       await setDoc(testdoc, {});
//     });
//   }
// });

// describe("DeliveryProgress collection rules", () => {
//   it("rejects read and write from unregistered driver users.", async function () {
//     const unauthedDb = testEnvironment.unauthenticatedContext().firestore();

//     const testdoc = unauthedDb
//       .collection("drivers")
//       .doc("user_1")
//       .collection("ordersForDelivery")
//       .doc("xyz")
//       .collection("deliveryProgress")
//       .doc("progress_1");

//     await assertFails(getDoc(testdoc));
//     await assertFails(setDoc(testdoc, {test: "test1"}));
//   });

//   it("allows read from registered driver users.", async function () {
//     const authedDb = testEnvironment.authenticatedContext("user_1").firestore();

//     const testdoc = authedDb
//       .collection("drivers")
//       .doc("user_1")
//       .collection("ordersForDelivery")
//       .doc("xyz")
//       .collection("deliveryProgress")
//       .doc("progress_1");

//     await assertSucceeds(getDoc(testdoc));
//   });

//   it("rejects write from other driver users different from the owner.", async function () {
//     const authedDb = testEnvironment.authenticatedContext("user_2").firestore();

//     // Then test security rules by trying to read it using the client SDK.
//     const testdoc = authedDb
//       .collection("drivers")
//       .doc("user_1")
//       .collection("ordersForDelivery")
//       .doc("xyz")
//       .collection("deliveryProgress")
//       .doc("progress_1");

//     await assertFails(setDoc(testdoc, {test: "test1"}));
//   });

//   it("allows write from driver user's own document.", async function () {
//     const authedDb = testEnvironment.authenticatedContext("user_1").firestore();

//     const testdoc = authedDb
//       .collection("drivers")
//       .doc("user_1")
//       .collection("ordersForDelivery")
//       .doc("xyz")
//       .collection("deliveryProgress")
//       .doc("progress_1");

//     await assertSucceeds(setDoc(testdoc, {test: "test1"}));
//   });
// });
