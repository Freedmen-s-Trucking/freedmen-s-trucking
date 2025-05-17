import {DriverEntity, FIXED_DRIVER_SERVICE_FEE_PERCENT, NewOrder, VehicleType} from "@freedmen-s-trucking/types";
import {QueryDocumentSnapshot} from "firebase-admin/firestore";

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
