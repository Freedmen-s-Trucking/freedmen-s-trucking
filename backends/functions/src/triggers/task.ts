import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {
  CollectionName,
  DriverEntity,
  OrderEntity,
  OrderEntityFields,
  TaskGroupEntity,
  TaskGroupEntityFields,
} from "@freedmen-s-trucking/types";
import {CollectionReference, FieldPath, FieldValue, getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";

const notifyDriverOnTaskGroupUpdate = async (
  before: TaskGroupEntity | undefined,
  after: TaskGroupEntity | undefined,
  taskGroupId: string,
) => {
  if (!after || !after[TaskGroupEntityFields.driverId]) {
    return;
  }

  const driverId = after[TaskGroupEntityFields.driverId];
  const firestore = getFirestore();
  const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  const driverSnapshot = await driverCollection.doc(driverId).get();
  const driver = driverSnapshot.data() as DriverEntity | undefined;
  if (!driver) {
    console.error(
      `The driver: #${driverId.slice(0, 5)} assigned to task group #${taskGroupId.slice(0, 5)} does not exist`,
    );
    return;
  }

  const tokens = Object.values(driver.fcmTokenMap || {});
  if (!tokens.length) {
    console.warn(
      `No tokens found for driver: "${driver.displayName}" #${driverId.slice(0, 5)} assigned to task group #${taskGroupId.slice(0, 5)}`,
    );
    return;
  }

  const isNewlyAssignedTask =
    !before || after[TaskGroupEntityFields.orderIds].length === before[TaskGroupEntityFields.orderIds].length;
  const newOrderIds = after[TaskGroupEntityFields.orderIds]
    .filter((orderId) => !before || !before[TaskGroupEntityFields.orderIds].includes(orderId))
    .map((orderId) => ({orderId, order: after[TaskGroupEntityFields.orderIdValueMap][orderId]}));

  if (!newOrderIds.length) {
    return;
  }
  const title = isNewlyAssignedTask ? "New Delivery Task Assigned" : "Delivery Task Updated: New Stop Added";
  const body = isNewlyAssignedTask
    ? `You have a new task with ${newOrderIds.length} order(s)`
    : `Your task #${taskGroupId.slice(0, 5)} has been updated with ${newOrderIds.length} new stop(s)`;

  await getMessaging()
    .sendEachForMulticast({
      notification: {
        title,
        body,
      },
      tokens: tokens,
    })
    .then((response) => {
      console.log(
        `Successfully sent task update push notification to driver#${driverSnapshot.id.slice(0, 8)} - ${driver?.displayName}: notifications sent to ${tokens.length} devices`,
        response,
      );
    })
    .catch((error) => {
      console.warn(
        `Failed to send task update push notification to driver#${driverSnapshot.id.slice(0, 8)} - ${driver?.displayName}: attempt notification on ${tokens.length} devices`,
        error,
      );
    });
};

const updateOrdersDriverOnTaskGroupDriverUpdate = async (
  before: TaskGroupEntity | undefined,
  after: TaskGroupEntity | undefined,
  taskGroupId: string,
) => {
  console.debug("updateOrdersDriverOnTaskGroupDriverUpdate");
  if (!after || !after[TaskGroupEntityFields.orderIds].length) {
    console.debug("after is falsy or orderIds is empty, exiting.");
    return;
  }
  const newOrderIds =
    before?.[TaskGroupEntityFields.driverId] !== after[TaskGroupEntityFields.driverId]
      ? after[TaskGroupEntityFields.orderIds]
      : after[TaskGroupEntityFields.orderIds].filter(
          (orderId) => !before || !before[TaskGroupEntityFields.orderIds].includes(orderId),
        );

  console.debug("newOrderIds", newOrderIds);
  if (!newOrderIds.length) {
    console.debug("no new order ids, exiting.");
    return;
  }

  let driver: DriverEntity | undefined;
  if (after[TaskGroupEntityFields.driverId]) {
    const driverCollection = getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<
      DriverEntity,
      DriverEntity
    >;
    const driverSnapshot = await driverCollection.doc(after[TaskGroupEntityFields.driverId]).get();
    driver = driverSnapshot.data();
  } else {
    driver = undefined;
  }

  console.debug("assigned driver", driver);

  const orderIds = after[TaskGroupEntityFields.orderIds];
  const firestore = getFirestore();
  const orderCollection = firestore.collection(CollectionName.ORDERS) as CollectionReference<OrderEntity, OrderEntity>;
  const orderSnapshots = await orderCollection.where(FieldPath.documentId(), "in", orderIds).get();
  const orders = orderSnapshots.docs;

  await Promise.all(
    orders.map((order) => {
      const orderData = order.data();
      if (!orderData) {
        console.error(`Order #${order.id} not found`);
        return;
      }
      console.debug(`updating order #${order.id}`);

      const orderRef = orderCollection.doc(order.id);
      const taskOrderDetails = after[TaskGroupEntityFields.orderIdValueMap][order.id];
      return orderRef.update({
        assignedDriverId: driver?.uid || null,
        task: !driver
          ? null
          : ({
              driverId: driver.uid,
              driverName: driver.displayName,
              driverEmail: driver.email || "",
              driverPhone: driver.phoneNumber || "",
              driverPhotoURL: driver.photoURL || null,
              driverUploadedProfileStoragePath: driver.uploadedProfileStoragePath || null,
              deliveryFee: orderData?.[OrderEntityFields.driverFeesInUSD],
              driverStatus: taskOrderDetails.driverStatus || null,
              driverConfirmationCode: taskOrderDetails.driverConfirmationCode || null,
              deliveredOrderConfirmationImage: taskOrderDetails.deliveredOrderConfirmationImage || null,
              driverPositions: taskOrderDetails.driverPositions || {},
              payoutPaymentRef: taskOrderDetails.payoutPaymentRef || null,
              taskId: taskGroupId,
            } satisfies OrderEntity["task"]),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }),
  );
};

export const taskGroupUpdateTrigger = onDocumentUpdated(
  `${CollectionName.TASK_GROUPS}/{taskGroupId}`,
  async ({data, params}) => {
    const before = data?.before?.data?.() as TaskGroupEntity | undefined;
    const after = data?.after?.data?.() as TaskGroupEntity | undefined;
    const taskGroupId = params.taskGroupId;
    const waterFall = [
      updateOrdersDriverOnTaskGroupDriverUpdate(before, after, taskGroupId),
      notifyDriverOnTaskGroupUpdate(before, after, taskGroupId),
    ];

    return Promise.all(waterFall);
  },
);
