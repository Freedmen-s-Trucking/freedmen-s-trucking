import {Hono} from "hono";
import {CollectionName, DriverEntity, TaskGroupEntity, type, UserEntity} from "@freedmen-s-trucking/types";
import {getFirestore, CollectionReference, FieldValue} from "firebase-admin/firestore";
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

export default router;
