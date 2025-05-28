import {Hono} from "hono";
import {
  apiReqUpdateOrderStatus,
  CollectionName,
  DriverEntity,
  DriverOrderStatus,
  OrderEntity,
  OrderEntityFields,
  TaskGroupEntity,
  TaskGroupEntityFields,
  TaskGroupStatus,
  type,
  UserEntity,
} from "@freedmen-s-trucking/types";
import {getFirestore, CollectionReference, FieldValue, UpdateData, DocumentReference} from "firebase-admin/firestore";
import {Variables} from "~src/utils/types";

const router = new Hono<{Variables: Variables}>();

router.post("/remove-driver", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({error: "Unauthorized"}, 401);
  }

  const req = type({
    taskId: type("string").atLeastLength(1),
  })(await c.req.json());
  if (req instanceof type.errors) {
    return c.json({error: req.summary}, 400);
  }

  const userRef = (getFirestore().collection(CollectionName.USERS) as CollectionReference<UserEntity, UserEntity>).doc(
    user.uid,
  );
  const maybeAdmin = (await userRef.get()).data()?.isAdmin;

  if (!maybeAdmin) {
    return c.json({error: "Must be an admin to remove a driver from task group"}, 401);
  }

  const taskGroupRef = (
    getFirestore().collection(CollectionName.TASK_GROUPS) as CollectionReference<TaskGroupEntity, TaskGroupEntity>
  ).doc(req.taskId);
  const taskGroup = (await taskGroupRef.get()).data();

  if (!taskGroup) {
    return c.json({error: "Task group not found"}, 404);
  }

  if (!taskGroup.driverId) {
    return c.json({error: "Task group has no driver"}, 400);
  }

  const driverRef = (
    getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<DriverEntity, DriverEntity>
  ).doc(taskGroup.driverId);
  const driver = (await driverRef.get()).data();

  if (!driver) {
    return c.json({error: "Driver not found"}, 404);
  }

  await Promise.all([
    taskGroupRef.update({
      driverId: null,
      driverInfo: null,
      updatedAt: FieldValue.serverTimestamp(),
    }),
    driverRef.update({
      activeTasks: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    }),
  ]);

  return c.json({success: true}, 200);
});

router.post("/assign-driver", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({error: "Unauthorized"}, 401);
  }

  const req = type({
    taskId: type("string").atLeastLength(1),
    driverId: type("string").atLeastLength(1),
  })(await c.req.json());
  if (req instanceof type.errors) {
    return c.json({error: req.summary}, 400);
  }

  const userRef = (getFirestore().collection(CollectionName.USERS) as CollectionReference<UserEntity, UserEntity>).doc(
    user.uid,
  );
  const maybeAdmin = (await userRef.get()).data()?.isAdmin;

  if (!maybeAdmin) {
    return c.json({error: "Must be an admin to remove a driver from task group"}, 401);
  }

  const taskGroupRef = (
    getFirestore().collection(CollectionName.TASK_GROUPS) as CollectionReference<TaskGroupEntity, TaskGroupEntity>
  ).doc(req.taskId);
  const taskGroup = (await taskGroupRef.get()).data();

  if (!taskGroup) {
    return c.json({error: "Task group not found"}, 404);
  }

  const driverRef = (
    getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<DriverEntity, DriverEntity>
  ).doc(req.driverId);
  const driver = (await driverRef.get()).data();

  if (!driver) {
    return c.json({error: "Driver not found"}, 404);
  }

  await Promise.all([
    taskGroupRef.update({
      driverId: req.driverId,
      driverInfo: {
        displayName: driver.displayName,
        photoURL: driver.photoURL || null,
        uploadedProfileStoragePath: driver.uploadedProfileStoragePath || null,
        phoneNumber: driver.phoneNumber || null,
        email: driver.email || null,
      },
      updatedAt: FieldValue.serverTimestamp(),
    }),
    driverRef.update({
      activeTasks: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    }),
  ]);

  return c.json({success: true}, 200);
});

router.post("/update-order-status", async (c) => {
  const req = apiReqUpdateOrderStatus(await c.req.json());
  if (req instanceof type.errors) {
    return c.json({error: req.summary}, 400);
  }
  const userId = c.get("user")?.uid;
  if (!userId) {
    return c.json({message: "Unauthorized: authenticated driver is required"}, 401);
  }
  const {taskId, orderId, driverStatus, coords, driverConfirmationCode, deliveredOrderConfirmationImage} = req;
  const taskRef = (
    getFirestore().collection(CollectionName.TASK_GROUPS) as CollectionReference<TaskGroupEntity, TaskGroupEntity>
  ).doc(taskId);

  const taskDocSnapshot = await taskRef.get();
  if (!taskDocSnapshot.exists) {
    throw new Error("Task not found");
  }

  const task = taskDocSnapshot.data() as TaskGroupEntity;

  if (!task.driverId) {
    throw new Error("Task has no driver");
  }

  const hasDriverStartedTask =
    driverStatus === DriverOrderStatus.ON_THE_WAY_TO_PICKUP ||
    driverStatus === DriverOrderStatus.ON_THE_WAY_TO_DELIVER ||
    driverStatus === DriverOrderStatus.DELIVERED ||
    Object.values(task[TaskGroupEntityFields.orderIdValueMap]).some(
      (order) =>
        order[OrderEntityFields.driverStatus] === DriverOrderStatus.ON_THE_WAY_TO_PICKUP ||
        order[OrderEntityFields.driverStatus] === DriverOrderStatus.ON_THE_WAY_TO_DELIVER ||
        order[OrderEntityFields.driverStatus] === DriverOrderStatus.DELIVERED,
    );

  const hasCompletedTheTask =
    driverStatus === DriverOrderStatus.DELIVERED &&
    Object.entries(task[TaskGroupEntityFields.orderIdValueMap]).every(
      ([id, order]) => order[OrderEntityFields.driverStatus] === DriverOrderStatus.DELIVERED || id === orderId,
    );

  if (task.driverId !== userId) {
    throw new Error("Unauthorized");
  }

  if (driverStatus === DriverOrderStatus.DELIVERED && (!driverConfirmationCode || !deliveredOrderConfirmationImage)) {
    throw new Error("Confirmation code and confirmation image are required for delivered orders");
  }

  const taskGroupUpdate = (taskRef as DocumentReference<TaskGroupEntity>).update({
    [`${TaskGroupEntityFields.orderIdValueMap}.${orderId}.${OrderEntityFields.driverStatus}`]: driverStatus,
    [`${TaskGroupEntityFields.orderIdValueMap}.${orderId}.${OrderEntityFields.driverConfirmationCode}`]:
      driverConfirmationCode || null,
    [`${TaskGroupEntityFields.orderIdValueMap}.${orderId}.${OrderEntityFields.deliveredOrderConfirmationImage}`]:
      deliveredOrderConfirmationImage || null,
    [`${TaskGroupEntityFields.orderIdValueMap}.${orderId}.${OrderEntityFields.driverPositions}.${driverStatus}`]:
      coords,
    ...(task[TaskGroupEntityFields.status] === TaskGroupStatus.IDLE && hasDriverStartedTask
      ? {
          [TaskGroupEntityFields.status]: TaskGroupStatus.IN_PROGRESS,
        }
      : {}),
    ...(hasCompletedTheTask
      ? {
          [TaskGroupEntityFields.status]: TaskGroupStatus.COMPLETED,
        }
      : {}),
    [TaskGroupEntityFields.updatedAt]: FieldValue.serverTimestamp(),
  });

  const orderRef = (
    getFirestore().collection(CollectionName.ORDERS) as CollectionReference<OrderEntity, OrderEntity>
  ).doc(orderId);
  const orderDocSnapshot = await orderRef.get();
  if (!orderDocSnapshot.exists) {
    throw new Error("Order not found");
  }
  const prevOrder = orderDocSnapshot.data() as OrderEntity;
  if (userId !== prevOrder[OrderEntityFields.task]?.driverId) {
    throw new Error("Unauthorized");
  }

  await Promise.all([
    taskGroupUpdate,
    orderRef.update({
      [`${OrderEntityFields.task}.${OrderEntityFields.driverStatus}`]: driverStatus,
      ...(!!driverConfirmationCode && {
        [`${OrderEntityFields.task}.${OrderEntityFields.driverConfirmationCode}`]: driverConfirmationCode,
      }),
      ...(!!deliveredOrderConfirmationImage && {
        [`${OrderEntityFields.task}.${OrderEntityFields.deliveredOrderConfirmationImage}`]:
          deliveredOrderConfirmationImage,
      }),
      [`${OrderEntityFields.task}.${OrderEntityFields.updatedAt}`]: FieldValue.serverTimestamp(),
      [`${OrderEntityFields.task}.${OrderEntityFields.driverPositions}.${driverStatus}`]: coords,
    }),
  ]);

  return c.json({success: true}, 200);
});

export default router;
