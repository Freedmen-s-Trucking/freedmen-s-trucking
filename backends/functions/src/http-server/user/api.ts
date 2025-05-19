import {Hono} from "hono";
import {CollectionName, type, UserEntity, DriverEntity} from "@freedmen-s-trucking/types";
import {getFirestore, CollectionReference} from "firebase-admin/firestore";
import {Variables} from "~src/utils/types";

const router = new Hono<{Variables: Variables}>();

const apiReqUpdateFCMToken = type({
  token: "string",
  deviceFingerprint: "string",
});

router.post("/update-fcm-token", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({error: "Unauthorized"}, 401);
  }
  const req = apiReqUpdateFCMToken(await c.req.json());
  if (req instanceof type.errors) {
    return c.json({error: req.summary}, 400);
  }
  const token = req.token;

  const userRef = (getFirestore().collection(CollectionName.USERS) as CollectionReference<UserEntity, UserEntity>).doc(
    user.uid,
  );

  await userRef.update({
    [`fcmTokenMap.${req.deviceFingerprint}`]: token,
  });

  const driverRef = (
    getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<DriverEntity, DriverEntity>
  ).doc(user.uid);

  const driver = await driverRef.get();
  if (driver.exists) {
    await driverRef.update({
      [`fcmTokenMap.${req.deviceFingerprint}` as const]: token,
    });
  }

  return c.json({success: true}, 200);
});

export default router;
