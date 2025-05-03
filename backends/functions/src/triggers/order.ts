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
} from "@freedmen-s-trucking/types";
import {
  CollectionReference,
  DocumentReference,
  FieldValue,
  getFirestore,
  PartialWithFieldValue,
} from "firebase-admin/firestore";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {transferFundsToDriver} from "~src/http-server/stripe/payment";

const updateOrderStatusOnAllSubTaskCompleted = async (
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
  const isAllSubTasksCompleted = (after?.[OrderEntityFields.assignedDriverIds] || ["fake"]).every(
    (driverId) => after?.[`task-${driverId}`]?.driverStatus === DriverOrderStatus.DELIVERED,
  );
  const newlyCompletedTasks: OrderEntity["task-${string}"][] = (after?.[OrderEntityFields.assignedDriverIds] || [])
    .map((driverId) => {
      const atask = after?.[`task-${driverId}`];
      const btask = before?.[`task-${driverId}`];
      if (btask?.driverStatus === atask?.driverStatus) {
        return null;
      }
      if (atask?.driverStatus !== DriverOrderStatus.DELIVERED) {
        return null;
      }
      return atask;
    })
    .filter((task) => task !== null);

  const firestore = getFirestore();
  const waterFall = [];
  for (const task of newlyCompletedTasks) {
    const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
      DriverEntity,
      DriverEntity
    >;
    waterFall.push(
      driverCollection.doc(task.driverId).update({
        activeTasks: FieldValue.increment(-1),
        tasksCompleted: FieldValue.increment(1),
      }),
    );
  }
  if (!isAllSubTasksCompleted) {
    console.log("Not all sub tasks are completed");
    await Promise.all(waterFall);
    return;
  }

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
  const completedTasks: OrderEntity["task-${string}"][] = (after?.[OrderEntityFields.assignedDriverIds] || [])
    .map((driverId) => {
      const task = after?.[`task-${driverId}`];
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
        `task-${task.driverId}`,
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
            [`task-${task.driverId}` satisfies keyof OrderEntity]: {
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

export const orderUpdateTrigger = onDocumentUpdated(`${CollectionName.ORDERS}/{orderId}`, async ({data, params}) => {
  const before = data?.before?.data?.() as OrderEntity | undefined;
  const after = data?.after?.data?.() as OrderEntity | undefined;
  const orderId = params.orderId;
  const waterFall = [
    updateOrderStatusOnAllSubTaskCompleted(before, after, orderId),
    payOutDriversOnDeliveryCompleted(before, after, orderId),
  ];

  return Promise.all(waterFall);
});
