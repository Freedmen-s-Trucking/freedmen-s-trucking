import {Hono} from "hono";
import {CollectionName, OrderEntity, DriverEntity, OrderEntityFields} from "@freedmen-s-trucking/types";
import {getFirestore, CollectionReference, UpdateData} from "firebase-admin/firestore";
import {getGeoHash} from "~src/utils/geolocation/geolocation_utils";

const router = new Hono();

router.get("/drivers", async (c) => {
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
  return c.json(await Promise.all(driversData), 200);
});

router.get("/orders", async (c) => {
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
    }

    if (Object.keys(updateOnOrder).length > 0) {
      return order.ref.update(updateOnOrder);
    }
    return Promise.resolve(null);
  });
  return c.json(await Promise.all(ordersData), 200);
});

export default router;
