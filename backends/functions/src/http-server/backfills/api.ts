import {Hono} from "hono";
import {CollectionName, OrderEntity, DriverEntity, OrderEntityFields, UserEntity} from "@freedmen-s-trucking/types";
import {getFirestore, CollectionReference, UpdateData} from "firebase-admin/firestore";
import {getGeoHash} from "~src/utils/geolocation/geolocation_utils";

const router = new Hono();

async function backfillUsers() {
  const firestore = getFirestore();
  const userCollection = firestore.collection(CollectionName.USERS) as CollectionReference<UserEntity, UserEntity>;
  const users = await userCollection.get();
  const usersData = users.docs.map(async (user) => {
    const data: UserEntity & {fcmTokenMaps?: Record<string, string>} = user.data();
    if (data?.fcmTokenMaps) {
      return user.ref.update({
        fcmTokenMap: data.fcmTokenMaps,
      });
    }
    return Promise.resolve(null);
  });
  return Promise.all(usersData);
}

async function backfillDrivers() {
  const firestore = getFirestore();
  const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  const drivers = await driverCollection.get();
  const driversData = drivers.docs.map(async (driver) => {
    const data: DriverEntity = driver.data();
    const latestLocation = data?.latestLocation;
    if (!latestLocation) return Promise.resolve(null);
    if (latestLocation.geoHash) return Promise.resolve(null);
    return driver.ref.update({
      "latestLocation.geoHash": getGeoHash(latestLocation.latitude, latestLocation.longitude),
    });
  });
  return Promise.all(driversData);
}

async function backfillsOrders() {
  const firestore = getFirestore();
  const orderCollection = firestore.collection(CollectionName.ORDERS) as CollectionReference<OrderEntity, OrderEntity>;
  const orders = await orderCollection.get();
  const ordersData = orders.docs.map(async (order) => {
    const data: OrderEntity & {[key: `task-${string}`]: OrderEntity["task"]; assignedDriverIds?: string[]} =
      order.data();
    const updateOnOrder: UpdateData<OrderEntity> = {};
    if (!data[OrderEntityFields.assignedDriverId] && data[OrderEntityFields.assignedDriverId] !== null) {
      updateOnOrder[OrderEntityFields.assignedDriverId] = null;
    }
    const driverId = data.assignedDriverIds?.[0];
    if (driverId) {
      updateOnOrder[OrderEntityFields.task] = data[`task-${driverId}`];
      updateOnOrder[OrderEntityFields.assignedDriverId] = driverId;

      if (
        updateOnOrder[OrderEntityFields.task] &&
        !updateOnOrder[OrderEntityFields.task][OrderEntityFields.driverPhotoURL] &&
        !updateOnOrder[OrderEntityFields.task][OrderEntityFields.driverUploadedProfileStoragePath]
      ) {
        const driver = await firestore.collection(CollectionName.DRIVERS).doc(driverId).get();
        const driverData = driver.data() as DriverEntity | undefined;
        if (driverData?.photoURL) {
          updateOnOrder[OrderEntityFields.task][OrderEntityFields.driverPhotoURL] = driverData?.photoURL;
        }
        if (driverData?.uploadedProfileStoragePath) {
          updateOnOrder[OrderEntityFields.task][OrderEntityFields.driverUploadedProfileStoragePath] =
            driverData?.uploadedProfileStoragePath;
        }
      }
    }

    if (Object.keys(updateOnOrder).length > 0) {
      return order.ref.update(updateOnOrder);
    }
    return Promise.resolve(null);
  });
  return Promise.all(ordersData);
}

router.get("/drivers", async (c) => {
  return c.json(await backfillDrivers(), 200);
});

router.get("/orders", async (c) => {
  return c.json(await backfillsOrders(), 200);
});

router.get("/users", async (c) => {
  return c.json(await backfillUsers(), 200);
});

router.get("/all", async (c) => {
  return c.json(await Promise.all([backfillDrivers(), backfillsOrders(), backfillUsers()]), 200);
});

export default router;
