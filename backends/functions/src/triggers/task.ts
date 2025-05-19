import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {CollectionName, DriverEntity, TaskGroupEntity, TaskGroupEntityFields} from "@freedmen-s-trucking/types";
import {CollectionReference, getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";

const notifyDriverOnTaskGroupStatusChange = async (
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

export const taskGroupUpdateTrigger = onDocumentUpdated(
  `${CollectionName.TASK_GROUPS}/{taskGroupId}`,
  async ({data, params}) => {
    const before = data?.before?.data?.() as TaskGroupEntity | undefined;
    const after = data?.after?.data?.() as TaskGroupEntity | undefined;
    const taskGroupId = params.taskGroupId;
    const waterFall = [notifyDriverOnTaskGroupStatusChange(before, after, taskGroupId)];

    return Promise.all(waterFall);
  },
);
