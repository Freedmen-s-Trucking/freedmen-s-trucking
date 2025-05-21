import {onSchedule} from "firebase-functions/v2/scheduler";
import {
  EntityWithID,
  Coordinate,
  OrderEntity,
  CollectionName,
  OrderEntityFields,
  TaskGroupEntityFields,
  TaskGroupEntity,
  EntityWithPartialID,
  TaskGroupStatus,
  DriverEntity,
  LATEST_PLATFORM_SETTINGS_PATH,
  PlatformSettingsEntity,
  DEFAULT_PLATFORM_SETTINGS,
  VerificationStatus,
  OrderStatus,
} from "@freedmen-s-trucking/types";
import {getDistanceFromGoogle} from "~src/utils/order";
import {
  getFirestore,
  CollectionReference,
  Timestamp,
  UpdateData,
  DocumentReference,
  QueryDocumentSnapshot,
  Filter,
} from "firebase-admin/firestore";
import {getGeoHash, getGeohashQueryBounds} from "~src/utils/geolocation/geolocation_utils";

/**
 * Type for tracking proximity between coordinates
 */
interface ProximityPair {
  order1Id: string;
  order2Id: string;
  pickupDistanceInMeter: number;
  dropoffDistanceInMeter: number;
}

/**
 * Finds the nearest driver to the task group.
 * @param taskGroup The task group to find the nearest driver for.
 * @return The nearest driver or null if no driver is found.
 */
const findNearestDriver = async (
  taskGroup: TaskGroupEntity,
  driverAssignmentRadiusInMeters: number,
): Promise<string | null> => {
  const bounds = getGeohashQueryBounds(
    [
      taskGroup[TaskGroupEntityFields.pickupCenterCoordinate].latitude,
      taskGroup[TaskGroupEntityFields.pickupCenterCoordinate].longitude,
    ],
    driverAssignmentRadiusInMeters,
  );
  const driverCollection = getFirestore().collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  const driverSnapshots = await Promise.all(
    bounds.map(([start, end]) =>
      driverCollection
        .where(
          Filter.or(
            Filter.where(
              "verificationStatus" satisfies keyof UpdateData<DriverEntity>,
              "==",
              "verified" satisfies VerificationStatus,
            ),
            Filter.and(
              Filter.where(
                "verificationStatus" satisfies keyof UpdateData<DriverEntity>,
                "==",
                "pending" satisfies VerificationStatus,
              ),
              Filter.where(
                "driverLicenseVerificationStatus" satisfies keyof UpdateData<DriverEntity>,
                "==",
                "verified" satisfies VerificationStatus,
              ),
              Filter.where(
                "driverInsuranceVerificationStatus" satisfies keyof UpdateData<DriverEntity>,
                "==",
                "verified" satisfies VerificationStatus,
              ),
            ),
          ),
        )
        .orderBy("latestLocation.geoHash" satisfies keyof UpdateData<DriverEntity>)
        .startAt(start)
        .endAt(end)
        .get(),
    ),
  );
  const drivers = driverSnapshots.reduce(
    (acc, snapshot) => acc.concat(snapshot.docs.map((doc) => doc)),
    <QueryDocumentSnapshot<DriverEntity>[]>[],
  );

  const firstDriverWithoutActiveTasks = drivers.find((driver) => (driver.data()?.activeTasks ?? 0) <= 0);
  if (firstDriverWithoutActiveTasks) {
    return firstDriverWithoutActiveTasks.id;
  }

  return drivers[0]?.id || null;
};

/**
 * Groups orders into task groups based on proximity and delivery constraints
 * @param existingTaskGroups Optional list of existing task groups to add orders to
 * @return Array of task groups
 */
export async function groupOrdersIntoTasks(
  eligibleOrders: EntityWithID<OrderEntity>[],
  existingTaskGroups: EntityWithPartialID<TaskGroupEntity>[],
  config: PlatformSettingsEntity["taskAssignmentConfig"],
): Promise<{taskGroups: EntityWithPartialID<TaskGroupEntity>[]; assignedOrderIds: Set<string>}> {
  if (eligibleOrders.length === 0) {
    return {taskGroups: existingTaskGroups, assignedOrderIds: new Set()};
  }

  // Copy existing task groups to avoid mutation
  const taskGroups = [...existingTaskGroups];

  const alreadyAssignedOrder = taskGroups.flatMap((group) =>
    Object.entries(group.data.orderIdValueMap).map(([id, order]) => ({
      id,
      data: {
        ...order,
        [OrderEntityFields.assignedDriverId]: group.data[TaskGroupEntityFields.driverId],
        [OrderEntityFields.status]: OrderStatus.TASKS_ASSIGNED,
      },
    })),
  );

  // Calculate distances between all orders
  const proximityPairs = await calculateAllProximities([...eligibleOrders, ...alreadyAssignedOrder]);

  const assignedOrderIds = new Set<string>();
  // First try to add orders to existing groups
  for (const order of eligibleOrders) {
    // Check if order has already been assigned to a group
    if (taskGroups.some((group) => group.data.orderIds.includes(order.id))) {
      continue;
    }

    // Try to fit this order into an existing group
    let addedToExistingGroup = false;

    for (const group of taskGroups) {
      // Skip full groups
      if (group.data.orderIds.length >= config.maxOrdersPerGroup) {
        continue;
      }

      // Check if this order can be added to the group
      if (await canAddOrderToGroup(order, group.data, eligibleOrders, proximityPairs, config)) {
        // Add the order to this group
        group.data.orderIds.push(order.id);
        assignedOrderIds.add(order.id);

        // Recalculate center coordinates for the group
        const groupOrders = eligibleOrders.filter((o) => group.data.orderIds.includes(o.id));
        group.data.pickupCenterCoordinate = calculateCenterCoordinate(groupOrders.map((o) => o.data.pickupLocation));
        group.data.dropoffCenterCoordinate = calculateCenterCoordinate(groupOrders.map((o) => o.data.deliveryLocation));
        group.data.pickupCenterGeoHash = getGeoHash(
          group.data.pickupCenterCoordinate.latitude,
          group.data.pickupCenterCoordinate.longitude,
        );
        group.data.dropoffCenterGeoHash = getGeoHash(
          group.data.dropoffCenterCoordinate.latitude,
          group.data.dropoffCenterCoordinate.longitude,
        );
        group.data.orderIdValueMap = group.data.orderIdValueMap || {};
        group.data.orderIdValueMap[order.id] = order.data;

        addedToExistingGroup = true;
        break;
      }
    }

    // If couldn't add to existing group, create a new one
    if (!addedToExistingGroup) {
      assignedOrderIds.add(order.id);
      taskGroups.push({
        id: null,
        data: {
          orderIds: [order.id],
          pickupCenterCoordinate: {
            latitude: order.data.pickupLocation.latitude,
            longitude: order.data.pickupLocation.longitude,
          },
          dropoffCenterCoordinate: {
            latitude: order.data.deliveryLocation.latitude,
            longitude: order.data.deliveryLocation.longitude,
          },
          pickupCenterGeoHash: getGeoHash(order.data.pickupLocation.latitude, order.data.pickupLocation.longitude),
          dropoffCenterGeoHash: getGeoHash(order.data.deliveryLocation.latitude, order.data.deliveryLocation.longitude),
          orderIdValueMap: {
            [order.id]: order.data,
          },
          status: TaskGroupStatus.IDLE,
          driverId: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
      });
    }
  }

  return {taskGroups, assignedOrderIds};
}

/**
 * Checks if an order can be added to an existing group based on proximity constraints
 */
async function canAddOrderToGroup(
  orderToAdd: EntityWithID<OrderEntity>,
  group: TaskGroupEntity,
  allOrders: EntityWithID<OrderEntity>[],
  proximityPairs: ProximityPair[],
  config: PlatformSettingsEntity["taskAssignmentConfig"],
): Promise<boolean> {
  // Get orders in this group
  const ordersInGroup = allOrders.filter((o) => group.orderIds.includes(o.id));

  // Check if the new order's pickup and dropoff points are within 3km of all orders in the group
  for (const existingOrder of ordersInGroup) {
    // Find the proximity pair for these two orders
    const pair = proximityPairs.find(
      (p) =>
        (p.order1Id === orderToAdd.id && p.order2Id === existingOrder.id) ||
        (p.order1Id === existingOrder.id && p.order2Id === orderToAdd.id),
    );

    if (!pair) {
      return false; // No proximity data found
    }

    // Check if distances exceed 3km (3000m)
    if (
      pair.pickupDistanceInMeter > config.pickupsGroupDistanceInMeters ||
      pair.dropoffDistanceInMeter > config.dropoffsGroupsDistanceInMeters
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates the center coordinate for a set of locations
 */
function calculateCenterCoordinate(locations: {latitude: number; longitude: number}[]): Coordinate {
  if (locations.length === 0) {
    throw new Error("Cannot calculate center coordinate for empty locations array");
  }

  const sum = locations.reduce(
    (acc, loc) => ({
      latitude: acc.latitude + loc.latitude,
      longitude: acc.longitude + loc.longitude,
    }),
    {latitude: 0, longitude: 0},
  );

  return {
    latitude: sum.latitude / locations.length,
    longitude: sum.longitude / locations.length,
  };
}

/**
 * Calculates proximity between all orders
 */
async function calculateAllProximities(orders: EntityWithID<OrderEntity>[]): Promise<ProximityPair[]> {
  const pairs: ProximityPair[] = [];

  // If there are less than 2 orders, there are no pairs to calculate
  if (orders.length < 2) {
    return pairs;
  }

  // Create arrays for the distance matrix calculations
  const pickupCoordinates: Coordinate[] = orders.map((o) => ({
    latitude: o.data.pickupLocation.latitude,
    longitude: o.data.pickupLocation.longitude,
  }));

  const dropoffCoordinates: Coordinate[] = orders.map((o) => ({
    latitude: o.data.deliveryLocation.latitude,
    longitude: o.data.deliveryLocation.longitude,
  }));

  // Get distance matrices for pickups and dropoffs
  // TODO: improve by splitting pickups and dropoffs in half.
  const pickupDistances = await getDistanceFromGoogle(pickupCoordinates, pickupCoordinates);
  const dropoffDistances = await getDistanceFromGoogle(dropoffCoordinates, dropoffCoordinates);

  // Create proximity pairs for all order combinations
  for (let i = 0; i < orders.length; i++) {
    for (let j = i + 1; j < orders.length; j++) {
      // Find the distances in the matrices
      const pickupDistance =
        pickupDistances.find((d) => d.originIndex === i && d.destinationIndex === j)?.distanceMeters || Infinity;

      const dropoffDistance =
        dropoffDistances.find((d) => d.originIndex === i && d.destinationIndex === j)?.distanceMeters || Infinity;

      pairs.push({
        order1Id: orders[i].id,
        order2Id: orders[j].id,
        pickupDistanceInMeter: pickupDistance,
        dropoffDistanceInMeter: dropoffDistance,
      });
    }
  }

  return pairs;
}

/**
 * Processes a set of new orders and returns grouped tasks
 * @param newOrders New orders to be grouped
 * @param existingTaskGroups Existing task groups (optional)
 * @returns Updated task groups
 */
export const scheduleGroupTaskInOrder = onSchedule("*/5 * * * *", async () => {
  console.log("Running scheduler for creating delivery tasks");
  const orderCollection = getFirestore().collection(CollectionName.ORDERS) as CollectionReference<
    OrderEntity,
    OrderEntity
  >;
  const orderQuery = orderCollection.where(OrderEntityFields.status, "==", "payment-received");
  const orderSnapshot = await orderQuery.get();
  const eligibleOrders = orderSnapshot.docs.map((doc) => ({id: doc.id, data: doc.data()}));

  if (eligibleOrders.length === 0) {
    return;
  }
  const platformSettingsCollection = getFirestore().doc(LATEST_PLATFORM_SETTINGS_PATH) as DocumentReference<
    PlatformSettingsEntity,
    PlatformSettingsEntity
  >;
  const platformSettingsSnapshot = await platformSettingsCollection.get();
  const _platformSettings = platformSettingsSnapshot.data();
  const maxDriverRadiusInMeters =
    _platformSettings?.taskAssignmentConfig?.maxDriverRadiusInMeters ||
    DEFAULT_PLATFORM_SETTINGS.taskAssignmentConfig.maxDriverRadiusInMeters;

  const taskGroupsCollection = getFirestore().collection(CollectionName.TASK_GROUPS) as CollectionReference<
    TaskGroupEntity,
    TaskGroupEntity
  >;
  const taskGroupsQuery = taskGroupsCollection.where(TaskGroupEntityFields.status, "==", "active");
  const taskGroupsSnapshot = await taskGroupsQuery.get();
  const existingTaskGroups = taskGroupsSnapshot.docs.map((doc) => ({id: doc.id, data: doc.data()}));

  // Group orders into tasks
  const updatedTaskGroups = await groupOrdersIntoTasks(eligibleOrders, existingTaskGroups, {
    ...DEFAULT_PLATFORM_SETTINGS.taskAssignmentConfig,
    ...(_platformSettings?.taskAssignmentConfig ?? {}),
  });

  const promiseTasks: Promise<unknown>[] = [];
  updatedTaskGroups.assignedOrderIds.forEach((orderId) => {
    promiseTasks.push(orderCollection.doc(orderId).update({status: OrderStatus.TASKS_ASSIGNED}));
  });
  // Update task groups in Firestore
  for (const taskGroup of updatedTaskGroups.taskGroups) {
    if (!taskGroup.data[TaskGroupEntityFields.driverId]) {
      // find the nearest driver for the task.
      const nearestDriverId = await findNearestDriver(taskGroup.data, maxDriverRadiusInMeters);
      if (nearestDriverId) {
        taskGroup.data[TaskGroupEntityFields.driverId] = nearestDriverId;
      }
    }
    if (!taskGroup.id) {
      promiseTasks.push(taskGroupsCollection.add(taskGroup.data));
    } else {
      promiseTasks.push(taskGroupsCollection.doc(taskGroup.id).set(taskGroup.data));
      // Handle driver notifications.
      // TODO: Notify driver about the update.
      if (!taskGroup.data.driverId) {
        continue;
      }
    }
  }

  await Promise.all(promiseTasks);

  return;
});

// /
// DEEPSEEK
// /
// interface TaskGroup {
//   id: string;
//   orderIds: string[];
//   pickupCenter: Coordinate;
//   dropoffCenter: Coordinate;
//   status: 'idle' | 'in-progress' | 'completed';
//   orders: typeof orderEntity.infer[];
// }

// interface Order {
//   id: string;
//   pickupLocation: Coordinate;
//   deliveryLocation: Coordinate;
//   eligibleForGrouping: boolean;
//   deliveryWindow: { start: Date; end: Date }; // Assuming deliveryWindow exists
// }

// async function calculateDistances(origin: Coordinate, destinations: Coordinate[]): Promise<number[]> {
//   if (destinations.length === 0) return [];
//   const response = await getDistanceFromGoogle([origin], destinations);
//   return response.sort((a, b) => a.destinationIndex - b.destinationIndex).map(r => r.distanceMeters);
// }

// function calculateCenter(coordinates: Coordinate[]): Coordinate {
//   const sum = coordinates.reduce((acc, curr) => {
//     acc.latitude += curr.latitude;
//     acc.longitude += curr.longitude;
//     return acc;
//   }, { latitude: 0, longitude: 0 });
//   return {
//     latitude: sum.latitude / coordinates.length,
//     longitude: sum.longitude / coordinates.length,
//   };
// }

// function doDeliveryWindowsOverlap(windows: { start: Date; end: Date }[]): boolean {
//   // Simplified: Check if all windows are within the same hour (adjust as needed)
//   const hours = windows.map(w => w.start.getHours());
//   return new Set(hours).size === 1;
// }

// export async function groupOrder(newOrder: Order): Promise<{
//   orderIds: string[];
//   pickupCenter: Coordinate;
//   dropoffCenter: Coordinate;
//   notes?: string;
// }> {
//   if (!newOrder.eligibleForGrouping) {
//     return {
//       orderIds: [newOrder.id],
//       pickupCenter: newOrder.pickupLocation,
//       dropoffCenter: newOrder.deliveryLocation,
//       notes: "Order not eligible for grouping",
//     };
//   }

//   // Fetch existing pending task groups (mock implementation)
//   const pendingTaskGroups: TaskGroup[] = await fetchPendingTaskGroups();

//   let bestGroup: TaskGroup | null = null;
//   let maxOrders = -1;

//   for (const group of pendingTaskGroups) {
//     if (group.orderIds.length >= 3) continue;

//     // Collect existing order details
//     const existingOrders = group.orders;
//     // const allOrders = [...existingOrders, newOrder];

//     // Check delivery window compatibility
//     // const deliveryWindows = allOrders.map(o => o.deliveryWindow);
//     // if (!doDeliveryWindowsOverlap(deliveryWindows)) continue;

//     // Check pickup proximity
//     const pickupDistances = await calculateDistances(
//       newOrder.pickupLocation,
//       existingOrders.map(o => o.pickupLocation)
//     );
//     const allPickupsValid = pickupDistances.every(d => d <= 3000);

//     // Check dropoff proximity
//     const dropoffDistances = await calculateDistances(
//       newOrder.deliveryLocation,
//       existingOrders.map(o => o.deliveryLocation)
//     );
//     const allDropoffsValid = dropoffDistances.every(d => d <= 3000);

//     if (allPickupsValid && allDropoffsValid) {
//       if (group.orderIds.length > maxOrders) {
//         bestGroup = group;
//         maxOrders = group.orderIds.length;
//       }
//     }
//   }

//   if (bestGroup) {
//     // Update the existing group
//     bestGroup.orderIds.push(newOrder.id);
//     bestGroup.orders.push(newOrder);
//     const newPickupCenter = calculateCenter(bestGroup.orders.map(o => o.pickupLocation));
//     const newDropoffCenter = calculateCenter(bestGroup.orders.map(o => o.deliveryLocation));

//     await updateTaskGroupInFirestore(bestGroup);

//     return {
//       orderIds: bestGroup.orderIds,
//       pickupCenter: newPickupCenter,
//       dropoffCenter: newDropoffCenter,
//     };
//   } else {
//     // Create new task group
//     const newGroup: TaskGroup = {
//       id: generateNewTaskGroupId(),
//       orderIds: [newOrder.id],
//       pickupCenter: newOrder.pickupLocation,
//       dropoffCenter: newOrder.deliveryLocation,
//       status: 'idle',
//       orders: [newOrder],
//     };

//     await saveTaskGroupToFirestore(newGroup);

//     return {
//       orderIds: [newOrder.id],
//       pickupCenter: newOrder.pickupLocation,
//       dropoffCenter: newOrder.deliveryLocation,
//       notes: "No suitable existing group found",
//     };
//   }
// }

// // Mock Firestore interaction functions
// async function fetchPendingTaskGroups(): Promise<TaskGroup[]> {
//   // Implementation to fetch groups from Firestore
//   return [];
// }

// async function updateTaskGroupInFirestore(group: TaskGroup) {
//   // Update Firestore record
// }

// async function saveTaskGroupToFirestore(group: TaskGroup) {
//   // Create new Firestore record
// }

// function generateNewTaskGroupId(): string {
//   return `task-${Math.random().toString(36).substr(2, 9)}`;
// }
