import {
  apiResSetupConnectedAccount,
  CollectionName,
  DriverEntity,
  LATEST_PLATFORM_OVERVIEW_PATH,
  newOrderEntity,
  OrderEntity,
  OrderEntityFields,
  OrderPrivateDetailsEntity,
  OrderPrivateDetailsEntityFields,
  OrderStatus,
  PaymentActorType,
  PaymentEntity,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  PlatformOverviewEntity,
  type,
  UserEntity,
} from "@freedmen-s-trucking/types";
import {
  CollectionReference,
  DocumentReference,
  FieldValue,
  getFirestore,
  WithFieldValue,
} from "firebase-admin/firestore";
import {Hono} from "hono";
import {onetimeFindRightDriversForOrder} from "~src/utils/order.js";
import {createPaymentIntent, generateConnectedAccountSetupLink} from "./payment";
import {handleStripeWebhookEvent} from "./webhook.js";
import {Variables} from "../../utils/types";
// import {getMessaging} from "firebase-admin/messaging";

const router = new Hono<{Variables: Variables}>();

router.post("/create-payment-intent", async (c) => {
  const response = await createPaymentIntent(await c.req.json(), c.get("user"));
  if (response instanceof Error) {
    return c.json({error: response.message}, 400);
  }
  return c.json({clientSecret: response.client_secret});
});

router.post("/setup-connected-account", async (c) => {
  const driver = apiResSetupConnectedAccount(await c.req.json());
  if (driver instanceof type.errors) {
    return c.json({error: driver.summary}, 400);
  }
  const response = await generateConnectedAccountSetupLink(driver, c.get("user"));
  if (response instanceof Error) {
    return c.json({error: response.message}, 400);
  }
  return c.json({response});
});

router.post("/webhook", async (c) => {
  const res = await handleStripeWebhookEvent({
    getHeader: (name) => c.req.header(name),
    getRawBody: () => c.req.arrayBuffer(),
    onAccountUpdated: async (account) => {
      const firestore = getFirestore();

      const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
        DriverEntity,
        DriverEntity
      >;
      const driverSnapshot = await driverCollection
        .where("stripeConnectAccountId" satisfies keyof DriverEntity, "==", account.id)
        .limit(1)
        .get();
      if (driverSnapshot.empty) {
        return new Error("Driver not found");
      }
      const driver = driverSnapshot.docs[0];
      await driverCollection.doc(driver.id).set(
        {
          payoutMethods: account.external_accounts?.data.map((pm) => ({
            id: pm.id,
            type: pm.object,
            status: pm.status,
            name: pm.object === "bank_account" ? pm.bank_name : pm.brand,
          })),
          payoutCapabilities: {
            transfers: account.capabilities?.transfers || "inactive",
          },
        },
        {merge: true},
      );
      return null;
    },
    onPaymentIntentSucceeded: async ({id, amount}, newOrder) => {
      if (!newOrder) {
        console.error("Invalid request: missing serializedOrder");
        return new Error("Invalid request: missing serializedOrder");
      }

      const verifiedNewOrder = newOrderEntity(newOrder);
      if (verifiedNewOrder instanceof type.errors) {
        return new Error(verifiedNewOrder.summary);
      }

      const firestore = getFirestore();

      // const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
      //   DriverEntity,
      //   DriverEntity
      // >;
      // const query = driverCollection
      //   .where(
      //     Filter.or(
      //       Filter.where(
      //         "verificationStatus" satisfies keyof DriverEntity,
      //         "==",
      //         "verified" satisfies VerificationStatus,
      //       ),
      //       Filter.and(
      //         Filter.where(
      //           "verificationStatus" satisfies keyof DriverEntity,
      //           "==",
      //           "pending" satisfies VerificationStatus,
      //         ),
      //         Filter.where(
      //           "driverLicenseVerificationStatus" satisfies keyof DriverEntity,
      //           "==",
      //           "verified" satisfies VerificationStatus,
      //         ),
      //       ),
      //     ),
      //   )
      //   .orderBy("activeTasks", "asc");
      // const snapshot = await query.get();
      const [drivers, unassignedVehicles] = onetimeFindRightDriversForOrder([], verifiedNewOrder);
      const userCollection = firestore.collection("users") as CollectionReference<UserEntity, UserEntity>;
      const user = await userCollection.doc(verifiedNewOrder.ownerId).get();

      // Save the payment.
      const paymentCollection = firestore.collection(CollectionName.PAYMENTS) as CollectionReference<
        PaymentEntity,
        PaymentEntity
      >;
      const paymentDocRef = await paymentCollection.add({
        type: PaymentType.INCOME,
        status: PaymentStatus.COMPLETED,
        amountInUSD: amount / 100,
        provider: {
          name: PaymentProvider.STRIPE,
          ref: id,
        },
        to: {
          id: "system",
          name: "Freedmen's Trucking",
          type: PaymentActorType.PLATFORM,
        },
        fee: 0,
        receivedAmount: amount / 100,
        from: {
          id: user.id,
          name: user.data()?.displayName || "",
          type: PaymentActorType.CUSTOMER,
        },
        date: new Date().toISOString(),
      });

      // Save the order.
      const orderCollection = firestore.collection(CollectionName.ORDERS) as CollectionReference<
        OrderEntity,
        OrderEntity
      >;
      const order: WithFieldValue<OrderEntity> = {
        ...verifiedNewOrder,
        [OrderEntityFields.clientName]: user.data()?.displayName || "",
        [OrderEntityFields.clientEmail]: user.data()?.email || "",
        [OrderEntityFields.clientPhone]: user.data()?.phoneNumber || "",
        [OrderEntityFields.status]: OrderStatus.PAYMENT_RECEIVED,
        // [OrderEntityFields.status]: unassignedVehicles.length === 0 ? OrderStatus.TASKS_ASSIGNED : OrderStatus.PAYMENT_RECEIVED,
        [OrderEntityFields.unassignedVehiclesTypes]: unassignedVehicles.map(([type]) => type),
        [OrderEntityFields.unassignedVehicles]: unassignedVehicles.map(([, details]) => ({
          deliveryFees: details.deliveryFees,
        })),
        [OrderEntityFields.assignedDriverIds]: [],
        // [OrderEntityFields.assignedDriverIds]: drivers.map((d) => d.uid),
        // ...drivers.reduce(
        //   (acc, driver) => {
        //     acc[`task-${driver.uid}` satisfies keyof OrderEntity] = {
        //       [OrderEntityFields.driverId]: driver.uid,
        //       [OrderEntityFields.driverName]: driver.displayName || "",
        //       [OrderEntityFields.driverEmail]: driver.email || "",
        //       [OrderEntityFields.driverPhone]: driver.phoneNumber || "",
        //       [OrderEntityFields.deliveryFee]: driver.deliveryFees,
        //       [OrderEntityFields.driverStatus]: DriverOrderStatus.WAITING,
        //       [OrderEntityFields.createdAt]: FieldValue.serverTimestamp(),
        //       [OrderEntityFields.updatedAt]: FieldValue.serverTimestamp(),
        //       [OrderEntityFields.deliveryScreenshotPath]: null,
        //     };
        //     return acc;
        //   },
        //   {} as Record<`task-${string}`, WithFieldValue<OrderEntity[`task-${string}`]>>,
        // ),
        [OrderEntityFields.createdAt]: FieldValue.serverTimestamp(),
        [OrderEntityFields.updatedAt]: FieldValue.serverTimestamp(),
        [OrderEntityFields.paymentRef]: paymentDocRef.path,
      };
      const createdOrder = await orderCollection.add(order);

      const orderPrivateDetailsCollection = firestore.collection(
        CollectionName.ORDERS_PRIVATE_DETAILS,
      ) as CollectionReference<OrderPrivateDetailsEntity, OrderPrivateDetailsEntity>;
      await orderPrivateDetailsCollection.doc(createdOrder.id).set({
        [OrderPrivateDetailsEntityFields.deliveryCode]: Math.random().toString(10).slice(2, 8),
      });

      // Update System summary.
      await (firestore.doc(LATEST_PLATFORM_OVERVIEW_PATH) as DocumentReference<PlatformOverviewEntity>).set(
        {
          totalActiveOrders: FieldValue.increment(1),
          totalEarnings: FieldValue.increment(amount / 100),
          updatedAt: FieldValue.serverTimestamp(),
        },
        {merge: true},
      );

      // // Update driver's active tasks.
      // for (const driver of drivers) {
      //   await driverCollection.doc(driver.uid).set(
      //     {
      //       activeTasks: FieldValue.increment(1),
      //     },
      //     {merge: true},
      //   );
      // }

      // // Send notification about newly assigned order
      // for (const driver of drivers) {
      //   const tokens = Object.values(driver.fcmTokenMap || {});
      //   if (!tokens.length) {
      //     continue;
      //   }

      //   getMessaging()
      //     .sendEachForMulticast({
      //       notification: {
      //         title: "New Order!",
      //         body: "You have a new order",
      //       },
      //       tokens: tokens,
      //     })
      //     .then((response) => {
      //       console.log("Successfully sent message:", response);
      //     })
      //     .catch((error) => {
      //       console.error("Error sending message:", error);
      //     });
      // }

      console.log({paymentIntent: {id, amount}, meta: newOrder});
      return null;
    },
  });

  if (res instanceof Error) {
    console.error(res);
    return c.json({error: res.message}, 400);
  }
  return c.json({received: true});
});

export default router;
