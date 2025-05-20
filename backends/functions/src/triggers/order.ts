import {
  CollectionName,
  DriverEntity,
  DriverOrderStatus,
  LATEST_PLATFORM_OVERVIEW_PATH,
  OrderEntity,
  OrderEntityFields,
  OrderStatus,
  PaymentActorType,
  PaymentEntity,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  PlatformOverviewEntity,
  UserEntity,
} from "@freedmen-s-trucking/types";
import {
  CollectionReference,
  DocumentReference,
  FieldValue,
  getFirestore,
  PartialWithFieldValue,
} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {transferFundsToDriver} from "~src/http-server/stripe/payment";

const updateOrderStatusOnTaskCompleted = async (
  before: OrderEntity | undefined,
  after: OrderEntity | undefined,
  orderId: string,
) => {
  const aStatus = after?.status;
  if (aStatus === OrderStatus.COMPLETED) {
    console.log("Order status is already completed", aStatus);
    return;
  }
  if (aStatus !== OrderStatus.TASKS_ASSIGNED) {
    console.log("Order status has unassigned tasks", aStatus);
    return;
  }
  const atask = after?.[OrderEntityFields.task];
  const btask = before?.[OrderEntityFields.task];
  if (btask?.driverStatus === atask?.driverStatus) {
    return;
  }
  if (atask?.driverStatus !== DriverOrderStatus.DELIVERED) {
    return;
  }

  const firestore = getFirestore();
  const waterFall = [];
  const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  waterFall.push(
    driverCollection.doc(atask.driverId).update({
      activeTasks: FieldValue.increment(-1),
      tasksCompleted: FieldValue.increment(1),
    }),
  );
  waterFall.push(
    (firestore.collection(CollectionName.ORDERS).doc(orderId) as DocumentReference<OrderEntity>).update({
      [OrderEntityFields.status]: OrderStatus.COMPLETED,
      [OrderEntityFields.updatedAt]: FieldValue.serverTimestamp(),
    } satisfies PartialWithFieldValue<OrderEntity>),
  );
  waterFall.push(
    (firestore.doc(LATEST_PLATFORM_OVERVIEW_PATH) as DocumentReference<PlatformOverviewEntity>).update({
      totalCompletedOrders: FieldValue.increment(1),
      totalActiveOrders: FieldValue.increment(-1),
    } satisfies PartialWithFieldValue<PlatformOverviewEntity>),
  );

  await Promise.all(waterFall);
};

const payOutDriversOnDeliveryCompleted = async (
  before: OrderEntity | undefined,
  after: OrderEntity | undefined,
  orderId: string,
) => {
  const aStatus = after?.status;
  if (!after || aStatus !== OrderStatus.COMPLETED) {
    return;
  }
  const completedTasks: Exclude<OrderEntity["task"], undefined>[] = [after?.[OrderEntityFields.task]]
    .map((task) => {
      return task?.driverStatus === DriverOrderStatus.DELIVERED ? task : null;
    })
    .filter((task) => task !== null);

  const firestore = getFirestore();
  const waterFall = [];
  for (const task of completedTasks) {
    if (task.payoutPaymentRef) {
      console.warn("Task already has payout id");
      continue;
    }
    const driverSnapshot = await firestore.collection(CollectionName.DRIVERS).doc(task.driverId).get();
    const driver = driverSnapshot.data() as DriverEntity | undefined;
    if (!driver) {
      console.error("Driver not found");
      continue;
    }
    if (!driver.stripeConnectAccountId) {
      console.error("Driver has no Stripe Connect account");
      continue;
    }
    if (driver.payoutCapabilities?.transfers !== "active") {
      console.error("Driver has no payout transfer capabilities please configure");
      continue;
    }

    try {
      const res = await transferFundsToDriver(
        driver,
        task.deliveryFee,
        {id: orderId, data: after},
        OrderEntityFields.task,
      );
      if (res instanceof Error) {
        console.error("Failed to transfer funds to driver;", res);
        continue;
      }
      const paymentCollection = firestore.collection(CollectionName.PAYMENTS) as CollectionReference<
        PaymentEntity,
        PaymentEntity
      >;
      const paymentDocRef = await paymentCollection.add({
        type: PaymentType.PAYOUT,
        status: PaymentStatus.COMPLETED,
        amountInUSD: res.amount / 100,
        provider: {
          name: PaymentProvider.STRIPE,
          ref: res.id,
        },
        from: {
          id: "system",
          name: "Freedmen's Trucking",
          type: PaymentActorType.PLATFORM,
        },
        fee: 0,
        receivedAmount: res.amount / 100,
        to: {
          id: driver.uid,
          name: driver.displayName || driver.email || "",
          type: PaymentActorType.DRIVER,
        },
        date: FieldValue.serverTimestamp(),
      });

      waterFall.push(
        (
          firestore.collection(CollectionName.ORDERS).doc(orderId) as DocumentReference<
            Partial<OrderEntity>,
            Partial<OrderEntity>
          >
        ).set(
          {
            [OrderEntityFields.task]: {
              ...task,
              payoutPaymentRef: `${CollectionName.PAYMENTS}/${paymentDocRef.id}`,
            },
          },
          {merge: true},
        ),
      );
    } catch (error) {
      console.error("Failed to transfer funds to driver", error);
      continue;
    }
  }
  await Promise.all(waterFall);
};

const notifyUserOnOrderStatusChange = async (
  before: OrderEntity | undefined,
  after: OrderEntity | undefined,
  orderId: string,
) => {
  if (!after || after.status === before?.status) {
    return;
  }
  const firestore = getFirestore();
  const userCollection = firestore.collection(CollectionName.USERS) as CollectionReference<UserEntity, UserEntity>;
  const userSnapshot = await userCollection.doc(after.ownerId).get();
  const user = userSnapshot.data() as UserEntity | undefined;
  if (!user) {
    console.log(`Owner #${after.ownerId} not found`);
    return;
  }

  const tokens = Object.values(user.fcmTokenMap || {});
  if (!tokens.length) {
    console.log(`Owner #${after.ownerId} has no FCM tokens`);
    return;
  }

  getMessaging()
    .sendEachForMulticast({
      notification: {
        title: `Order #${orderId.substring(0, 8)} Status Update`,
        body: `Your order has been updated to ${after.status}`,
      },
      tokens: tokens,
    })
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};

// const notifyDriversOnNewOrder = async (
//   before: OrderEntity | undefined,
//   after: OrderEntity | undefined,
//   orderId: string,
// ) => {
//   if (!after || after.status === before?.status) {
//     return;
//   }

//   const assignedDriversId = after?.[OrderEntityFields.assignedDriverId];
//   if (!assignedDriversId || before?.[OrderEntityFields.assignedDriverId] === assignedDriversId) {
//     return;
//   }
//   const firestore = getFirestore();
//   const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
//     DriverEntity,
//     DriverEntity
//   >;
//   const driverSnapshot = await driverCollection.where("uid", "==", assignedDriversId).get();
//   const drivers = driverSnapshot.docs.map((doc) => doc.data());
//   const tokens = drivers.map((driver) => Object.values(driver.fcmTokenMap || {})).flat();
//   if (!tokens.length) {
//     return;
//   }
//   getMessaging()
//     .sendEachForMulticast({
//       notification: {
//         title: "New Order",
//         body: `You have a new order #${orderId.substring(0, 4)}`,
//       },
//       tokens: tokens,
//     })
//     .then((response) => {
//       console.log("Successfully sent message:", response);
//     })
//     .catch((error) => {
//       console.error("Error sending message:", error);
//     });
// };

export const orderUpdateTrigger = onDocumentUpdated(`${CollectionName.ORDERS}/{orderId}`, async ({data, params}) => {
  const before = data?.before?.data?.() as OrderEntity | undefined;
  const after = data?.after?.data?.() as OrderEntity | undefined;
  const orderId = params.orderId;
  const waterFall = [
    // updateOrderStatusOnTaskCompleted(before, after, orderId),
    // payOutDriversOnDeliveryCompleted(before, after, orderId),
    notifyUserOnOrderStatusChange(before, after, orderId),
    // notifyDriversOnNewOrder(before, after, orderId),
  ];

  return Promise.all(waterFall);
});
