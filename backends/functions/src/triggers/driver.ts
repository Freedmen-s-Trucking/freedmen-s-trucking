import {
  CollectionName,
  DriverEntity,
  LATEST_PLATFORM_OVERVIEW_PATH,
  PlatformOverviewEntity,
} from "@freedmen-s-trucking/types";
import {DocumentReference, FieldValue, getFirestore} from "firebase-admin/firestore";
import {onDocumentWritten} from "firebase-functions/v2/firestore";

const updatePlatformOverviewOnDriverVerificationStatusChange = async (
  before: DriverEntity | undefined,
  after: DriverEntity | undefined,
) => {
  const bVStatus = before?.verificationStatus;
  const aVStatus = after?.verificationStatus;
  // TODO: Handle driver license verification status.
  if (aVStatus !== bVStatus) {
    const update = {} as Record<keyof PlatformOverviewEntity, FieldValue>;
    switch (aVStatus) {
      case "pending":
        update.totalPendingVerificationDrivers = FieldValue.increment(1);
        break;
      case "failed":
        update.totalFailedVerificationDrivers = FieldValue.increment(1);
        break;
      case "verified":
        update.totalVerifiedDrivers = FieldValue.increment(1);
        break;
    }
    switch (bVStatus) {
      case "pending":
        update.totalPendingVerificationDrivers = FieldValue.increment(-1);
        break;
      case "failed":
        update.totalFailedVerificationDrivers = FieldValue.increment(-1);
        break;
      case "verified":
        update.totalVerifiedDrivers = FieldValue.increment(-1);
        break;
    }

    if (Object.keys(update).length > 0) {
      update.updatedAt = FieldValue.serverTimestamp();
      const firestore = getFirestore();
      await (firestore.doc(LATEST_PLATFORM_OVERVIEW_PATH) as DocumentReference<PlatformOverviewEntity>).set(update, {
        merge: true,
      });
    }
  }
};

// const assignTaskToDriverWhenHeBecomesVerified = async (
//   before: DriverEntity | undefined,
//   after: DriverEntity | undefined,
//   driverId: string,
// ) => {
//   const bStatus = before?.verificationStatus;
//   const aStatus = after?.verificationStatus;
//   const isVerified =
//     aStatus === "verified" || (aStatus === "pending" && after?.driverLicenseVerificationStatus === "verified");
//   const vehicleChanged = after?.vehicles?.[0]?.type !== before?.vehicles?.[0]?.type;
//   const isNewlyVerified = isVerified && aStatus !== bStatus;
//   console.log({isVerified, vehicleChanged, isNewlyVerified});
//   if (isNewlyVerified || (isVerified && vehicleChanged)) {
//     const firestore = getFirestore();

//     const orderCollection = firestore.collection(CollectionName.ORDERS) as CollectionReference<
//       OrderEntity,
//       OrderEntity
//     >;
//     const driverVehicleType = after?.vehicles?.[0]?.type;
//     if (!driverVehicleType) {
//       return;
//     }
//     const query = orderCollection.where(
//       OrderEntityFields.assignedDriverId satisfies keyof OrderEntity,
//       "==",
//       null,
//     );
//     const snapshot = await query.limit(1).get();
//     if (snapshot.empty) {
//       console.info("No orders found for driver vehicle type", driverVehicleType);
//       return;
//     }
//     const order = snapshot.docs[0];
//     const orderData = order.data();
//     const vehicleToRemoveIdx = orderData.requiredVehicles.findIndex((v) => v.type === driverVehicleType);
//     if (vehicleToRemoveIdx === -1) {
//       console.error("Driver vehicle type unexpectedly not found in required vehicles");
//       return;
//     }
//     // Remove the driver vehicle type from the required vehicles array.
//     // orderData.unassignedVehiclesTypes.splice(vehicleToRemoveIdx, 1);

//     const details = orderData[OrderEntityFields.unassignedVehicles][vehicleToRemoveIdx];
//     if (!details) {
//       console.error(
//         "Vehicle unexpectedly not found in details array. However we found" +
//           " the vehicle type in unassigned vehicles types",
//       );
//       return;
//     }
//     orderData.unassignedVehicles.splice(vehicleToRemoveIdx, 1);
//     await firestore
//       .collection(CollectionName.ORDERS)
//       .doc(order.id)
//       .update({
//         [OrderEntityFields.status]:
//           orderData.unassignedVehicles.length === 0 ? OrderStatus.TASKS_ASSIGNED : OrderStatus.PAYMENT_RECEIVED,
//         [OrderEntityFields.unassignedVehicles]: orderData.unassignedVehicles,
//         [OrderEntityFields.unassignedVehiclesTypes]: orderData.unassignedVehiclesTypes,
//         [OrderEntityFields.assignedDriverIds]: orderData.assignedDriverIds.concat(after.uid),
//         [`task-${after.uid}` satisfies keyof OrderEntity]: {
//           [OrderEntityFields.driverId]: after.uid,
//           [OrderEntityFields.driverName]: after.displayName || "",
//           [OrderEntityFields.driverEmail]: after.email || "",
//           [OrderEntityFields.driverPhone]: after.phoneNumber || "",
//           [OrderEntityFields.deliveryFee]: details.deliveryFees,
//           [OrderEntityFields.driverStatus]: DriverOrderStatus.WAITING,
//           [OrderEntityFields.createdAt]: FieldValue.serverTimestamp(),
//           [OrderEntityFields.updatedAt]: FieldValue.serverTimestamp(),
//           [OrderEntityFields.deliveryScreenshotPath]: null,
//         } as WithFieldValue<OrderEntity[`task-${string}`]>,
//       } as PartialWithFieldValue<OrderEntity>);

//     const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
//       DriverEntity,
//       DriverEntity
//     >;
//     await driverCollection.doc(driverId).set(
//       {
//         activeTasks: FieldValue.increment(1),
//       },
//       {merge: true},
//     );
//   }
// };

export const driverUpdateTrigger = onDocumentWritten(`${CollectionName.DRIVERS}/{driverId}`, async ({data, params}) => {
  const before = data?.before?.data?.() as DriverEntity | undefined;
  const after = data?.after?.data?.() as DriverEntity | undefined;
  // const driverId = params.driverId;
  const waterFall = [
    updatePlatformOverviewOnDriverVerificationStatusChange(before, after),
    // assignTaskToDriverWhenHeBecomesVerified(before, after, driverId),
  ];

  return Promise.all(waterFall);
});
