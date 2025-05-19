import {
  CollectionName,
  Coordinate,
  DriverEntity,
  FIXED_DRIVER_SERVICE_FEE_PERCENT,
  NewOrder,
  OrderEntity,
  type,
  VehicleType,
} from "@freedmen-s-trucking/types";
import {
  CollectionReference,
  getFirestore,
  QueryDocumentSnapshot,
  Timestamp,
  UpdateData,
} from "firebase-admin/firestore";
import {ENV_GOOGLE_MAPS_API_KEY_BACKEND} from "./envs";
import {up} from "up-fetch";
import {DEFAULT_DRIVER_SEARCH_RADIUS_IN_METER} from "./constants";
import {sub} from "date-fns";
import {getGeohashQueryBounds} from "./geolocation/geolocation_utils";

type OneTimeFindRightDriversForOrderResponse = [
  (DriverEntity & {uid: string; deliveryFees: number})[],
  readonly [VehicleType, {deliveryFees: number}][],
];

/**
 * One-time function to find the right drivers for an order.
 * WARN: this function must be used only once per order on creation.
 *
 * @param {QueryDocumentSnapshot<DriverEntity>[]} snapshots The snapshots of the drivers collection.
 * @param {NewOrder} order The order to find the right drivers for.
 * @return {OneTimeFindRightDriversForOrderResponse} The right drivers for the order.
 */
export function onetimeFindRightDriversForOrder(
  snapshots: QueryDocumentSnapshot<DriverEntity>[],
  order: NewOrder,
): OneTimeFindRightDriversForOrderResponse {
  const drivers = [] as (DriverEntity & {uid: string; deliveryFees: number})[];
  const requiredVehicles = order.requiredVehicles.map((v) => ({
    type: v.type,
    quantity: v.quantity,
    deliveryFees: v.fees,
  }));
  for (const doc of snapshots) {
    const driver: DriverEntity & {uid: string} = {...doc.data(), uid: doc.id};
    if (!driver.vehicles || !driver.vehicles.length) {
      continue;
    }
    const driverVehicle = driver.vehicles[0]; // TODO: Driver has only one vehicle at the moment
    const requiredVehicle = requiredVehicles.find((v) => v.type === driverVehicle.type);
    if (requiredVehicle && requiredVehicle.quantity) {
      drivers.push({
        ...driver,
        deliveryFees:
          ((requiredVehicle.deliveryFees / requiredVehicle.quantity) * FIXED_DRIVER_SERVICE_FEE_PERCENT) / 100,
      });
      requiredVehicle.quantity--;
      requiredVehicle.deliveryFees -= requiredVehicle.deliveryFees / requiredVehicle.quantity;
    }
  }

  const unassignedVehicles = requiredVehicles.reduce(
    (acc, v) => {
      if (v.quantity > 0) {
        return acc.concat(
          Array(v.quantity).fill([
            v.type,
            {
              deliveryFees: (v.deliveryFees * FIXED_DRIVER_SERVICE_FEE_PERCENT) / 100,
            },
          ] as const),
        );
      }
      return acc;
    },
    <readonly [VehicleType, {deliveryFees: number}][]>[],
  );
  return [drivers, unassignedVehicles] as const;
}

const distanceMatrixAPIResponseType = type({
  distanceMeters: "number",
  duration: "string",
  condition: "string",
  originIndex: "number",
  destinationIndex: "number",
}).array();

/**
 * Get the distance between points from Google Maps
 * @param origins The starting points
 * @param destinations The end points
 * @return The distance in meters
 */
export const getDistanceFromGoogle = (
  origins: Coordinate[],
  destinations: Coordinate[],
): Promise<
  {
    distanceMeters: number;
    duration: string;
    condition: string;
    originIndex: number;
    destinationIndex: number;
  }[]
> => {
  const distanceApiRequest = up(fetch, () => ({
    baseUrl: "https://routes.googleapis.com",
    headers: {"X-Goog-Api-Key": ENV_GOOGLE_MAPS_API_KEY_BACKEND},
    retry: {
      attempts: 2,
      delay: 1000,
      when: (ctx) => {
        // Retry on timeout errors
        if (ctx.error) return (ctx.error as Error).name === "TimeoutError";
        // Retry on 429 server errors
        if (ctx.response) return ctx.response.status === 429;

        return false;
      },
    },
  }));
  return distanceApiRequest("/distanceMatrix/v2:computeRouteMatrix", {
    method: "POST",
    headers: {
      // "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "duration,distanceMeters,condition,originIndex,destinationIndex,",
    },
    body: {
      origins: origins.map((origin) => ({
        waypoint: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
          },
        },
        routeModifiers: {avoid_ferries: true},
      })),
      destinations: destinations.map((destination) => ({
        waypoint: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        },
      })),
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
    },
    schema: distanceMatrixAPIResponseType,
  });
};

// export async function groupNearbyOrders(orders: OrderEntity[]): Promise<OrderEntity[][]> {
//   const pickupLocations = orders.map((o) => ({
//     latitude: o.pickupLocation.latitude,
//     longitude: o.pickupLocation.longitude,
//   }));
//   const deliveryLocations = orders.map((o) => ({
//     latitude: o.deliveryLocation.latitude,
//     longitude: o.deliveryLocation.longitude,
//   }));
//   const distances = await getDistanceFromGoogle(pickupLocations, deliveryLocations);
//   const batches: OrderEntity[][] = [];
//   const ungrouped = [...orders];
//   while (ungrouped.length) {
//     const base = ungrouped.shift();
//     const group = [base];
//     for (let i = ungrouped.length - 1; i >= 0; i--) {
//       if (
//         group.every(
//           (o) =>
//             areLocationsClose(o.pickupLocation, ungrouped[i].pickupLocation, 3000) &&
//             areLocationsClose(o.deliveryLocation, ungrouped[i].deliveryLocation, 4800),
//         )
//       ) {
//         group.push(ungrouped.splice(i, 1)[0]);
//         if (group.length >= 3) break;
//       }
//     }
//     batches.push(group);
//   }
//   return batches;
// }

type DriverUpdateType = UpdateData<DriverEntity>;
type DriverUpdateKeys = keyof DriverUpdateType;

// async function getClosestDrivers(location: Coordinate, radiusInMeter: number): Promise<DriverEntity[]> {
//   const driverCollectionRef = getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<
//     DriverEntity,
//     DriverEntity
//   >;
//   const fiveMinutesAgo = sub(new Date(), {minutes: 5});
//   const bounds = getGeohashQueryBounds([location.latitude, location.longitude], radiusInMeter);
//   const query = driverCollectionRef
//     .where("latestLocation.timestamp" satisfies DriverUpdateKeys, ">", Timestamp.fromDate(fiveMinutesAgo))
//     .orderBy("latestLocation.geoHash" satisfies DriverUpdateKeys, "asc")
//     .startAt(bounds[0])
//     .endAt(bounds[1]);
//   const snapshot = await query.get();
//   const drivers = snapshot.docs.map((doc) => doc.data());
//   return drivers;
// }

// async function maybeAssignToTask(newOrder: NewOrder) {
//   const drivers = await getClosestDrivers(newOrder.pickupLocation, DEFAULT_DRIVER_SEARCH_RADIUS_IN_METER);async function maybeAssignToDeliveryTask(newOrder: Order, drivers: DriverPosition[]) {
//   const tasks = await getActiveTasks();
//   const allDriverCoords = drivers.map(d => d.coordinate);

//   for (const task of drivers) {
//     const taskPickups = task.orders.map(o => o.pickupLocation);
//     const taskDropoffs = task.orders.map(o => o.dropoffLocation);

//     const [pickupToTaskPickups, dropoffToTaskDropoffs, pickupToDrivers] = await Promise.all([
//       getDistanceFromGoogle([newOrder.pickupLocation], taskPickups),
//       getDistanceFromGoogle([newOrder.dropoffLocation], taskDropoffs),
//       getDistanceFromGoogle([newOrder.pickupLocation], allDriverCoords),
//     ]);

//     const pickupCloseToTask = pickupToTaskPickups.some(r => r.distanceMeters < 3000);
//     const dropoffCloseToTask = dropoffToTaskDropoffs.some(r => r.distanceMeters < 4000);

//     if (pickupCloseToTask && dropoffCloseToTask) {
//       return await addToTask(task.id, newOrder);
//     }

//     for (const [index, distance] of pickupToDrivers.entries()) {
//       const pickupCloseToDriver = distance.distanceMeters < 2000;
//       if (pickupCloseToDriver && dropoffCloseToTask) {
//         const driverId = drivers[distance.destinationIndex].driverId;
//         return await addToTask(task.id, newOrder, driverId);
//       }
//     }
//   }

//   // No match → Create a new task with nearest driver
//   const [pickupToDrivers] = await getDistanceFromGoogle([newOrder.pickupLocation], allDriverCoords);
//   const closestDriver = drivers[pickupToDrivers.destinationIndex];
//   return await createNewTask(newOrder, closestDriver.driverId);
// }
