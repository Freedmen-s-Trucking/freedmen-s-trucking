import {
  basePlatformFeeInUSD,
  ComputeDeliveryEstimation,
  Coordinate,
  coordinateType,
  defaultPlatformFeePercent,
  deliveryPriorityPricesAddons,
  DistanceMeasurement,
  OrderPriority,
  productWithQuantityType,
  RequiredVehicleEntity,
  type,
  VehicleInfo,
  VehicleType,
} from "@freedmen-s-trucking/types";
import { useQuery } from "@tanstack/react-query";
import { up } from "up-fetch";

import {
  ProductWithQuantity,
  vehiclesInfoList,
} from "@freedmen-s-trucking/types";

function getPackageVolumeInCubicFeet(pkg: ProductWithQuantity): number {
  return (
    (pkg.dimensions.heightInInches *
      pkg.dimensions.widthInInches *
      pkg.dimensions.lengthInInches) /
    1728
  );
}

/**
 * Calculate the minimum number of vehicles needed to deliver the packages
 * CAVEATS:
 * - This function does not consider the weight limit of the vehicle.
 * - This function does not take in consideration the dimensions limit of the vehicle. e.g Steel bar is too long to fit in a van but his volume is small enough.
 * - This function does not support splitting packages between vehicles.
 * @param packages The array of packages to be delivered
 * @returns The array of vehicles needed to deliver the packages
 */
export function computeTheMinimumRequiredVehiclesAndFees(
  packages: ProductWithQuantity[],
  distanceInMiles: number,
  priority: OrderPriority,
):
  | {
      vehicles: RequiredVehicleEntity[];
      fees: number;
    }
  | Error {
  const vehicles = <Record<VehicleType, RequiredVehicleEntity>>{};

  let currentVehicle: VehicleInfo | null = null;
  let remainingVolume = 0;
  let remainingWeight = 0;
  let currentPackageId = 0;
  let currentPackage = packages[currentPackageId];

  while (currentPackage) {
    const pkgVolume = getPackageVolumeInCubicFeet(currentPackage);
    const totalPkgVolumeToUse =
      remainingVolume + pkgVolume * currentPackage.quantity;
    // find the smallest vehicle that can fit the volume.
    const { id: currentVehicleId, remainingVolume: remainingVehicleVolume } =
      findVehicleIdBasedOnVolume(totalPkgVolumeToUse);
    currentVehicle = vehiclesInfoList[currentVehicleId];
    if (remainingVehicleVolume >= 0) {
      // we found the smallest vehicle that fit the volume.
      remainingVolume = totalPkgVolumeToUse;
      remainingWeight = currentPackage.weightInLbs * currentPackage.quantity;
      currentPackageId++;
      currentPackage = packages[currentPackageId] || null;
      continue;
    }

    // Adding the remaining volume to the current package*quantity is too big for the current vehicle.
    // We need to find the small quantity that can fit in the current vehicle.
    const usedPackageQuantity = Math.floor(
      (currentVehicle.avgCapacityInCubicFeet - remainingVolume) / pkgVolume,
    );
    if (usedPackageQuantity === 0 && remainingVolume === 0) {
      const errorMessage = `Unable to find a vehicle that can fit the package: ${currentPackage.name}. The highest capacity vehicle is ${currentVehicle.type} with a capacity of ${currentVehicle.avgCapacityInCubicFeet} cubic feet.`;
      return new Error(errorMessage);
    }

    vehicles[currentVehicle.type] = {
      type: currentVehicle.type,
      quantity: (vehicles[currentVehicle.type]?.quantity || 0) + 1,
      weightToBeUsedInLbs: [
        ...(vehicles[currentVehicle.type]?.weightToBeUsedInLbs || []),
        remainingWeight + usedPackageQuantity * currentPackage.weightInLbs,
      ],
    };

    remainingVolume = 0;
    remainingWeight = 0;
    currentVehicle = null;
    currentPackage.quantity -= usedPackageQuantity;
  }

  if (currentVehicle) {
    vehicles[currentVehicle.type] = {
      type: currentVehicle.type,
      quantity: (vehicles[currentVehicle.type]?.quantity || 0) + 1,
      weightToBeUsedInLbs: [
        ...(vehicles[currentVehicle.type]?.weightToBeUsedInLbs || []),
        remainingWeight,
      ],
    };
  }

  let fees: number[] = [];
  try {
    fees = Object.values(vehicles).map((vehicle) =>
      getFeesOfVehicle(vehicle, priority, distanceInMiles),
    );
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }

  return {
    vehicles: Object.values(vehicles),
    fees: fees.reduce((acc, fee) => acc + fee, 0),
  };
}

/**
 * Get the fees of a vehicle based on the priority and distance.
 * @param vehicle The vehicle to get the fees for
 * @param priority The priority of the order
 * @param distanceInMiles The distance in miles
 * @returns The fees of the vehicle
 */
function getFeesOfVehicle(
  vehicle: RequiredVehicleEntity,
  priority: OrderPriority,
  distanceInMiles: number,
): number {
  const vehicleInfo = vehiclesInfoList.find((v) => v.type === vehicle.type);
  if (!vehicleInfo) {
    throw new Error(`Unable to find vehicle info for type: ${vehicle.type}`);
  }

  const mileageCost =
    vehicleInfo.pricePerMile * distanceInMiles * vehicle.quantity;

  const priorityAddonCost =
    deliveryPriorityPricesAddons[priority] * distanceInMiles * vehicle.quantity;

  // Weight & Volume Fees Constraints
  // • $0.10/lb over 50 lbs
  // • $10 upgrade if volume exceeds 15 cu. ft. ???
  const weightCost = vehicle.weightToBeUsedInLbs.reduce(
    (acc, weight) => (weight > 50 ? acc + (weight - 50) * 0.1 : acc),
    0,
  );
  const volumeCost =
    vehicleInfo.avgCapacityInCubicFeet > 15 ? 10 * vehicle.quantity : 0;

  const totalCost =
    (basePlatformFeeInUSD +
      mileageCost +
      priorityAddonCost +
      weightCost +
      volumeCost) *
    (1 + defaultPlatformFeePercent / 100);

  return totalCost;
}

/**
 * Find the smallest vehicle that can fit the volume and return the vehicle id and the remaining volume.
 * @param cuFeet The volume in cubic feet
 * @returns The vehicle id and the remaining volume
 */
function findVehicleIdBasedOnVolume(cuFeet: number): {
  id: number;
  remainingVolume: number;
} {
  for (let i = 0; i < vehiclesInfoList.length; i++) {
    const vehicle = vehiclesInfoList[i];
    if (vehicle.avgCapacityInCubicFeet >= cuFeet) {
      return {
        id: i,
        remainingVolume: vehicle.avgCapacityInCubicFeet - cuFeet,
      };
    }
  }
  return {
    id: vehiclesInfoList.length - 1,
    remainingVolume:
      vehiclesInfoList[vehiclesInfoList.length - 1].avgCapacityInCubicFeet -
      cuFeet,
  };
}

/**
 * Get the distance between two points from OSRM
 * @param startingPoint The starting point
 * @param endPoint The end point
 * @returns The distance in meters
 */
const getDistance = (startingPoint: Coordinate, endPoint: Coordinate) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${endPoint.longitude},${endPoint.latitude};${startingPoint.longitude},${startingPoint.latitude}`;
  const fetcher = up(fetch, () => ({
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
  return fetcher(url, {
    schema: type({
      code: "string | 'Ok'",
      routes: type({
        distance: "number",
        duration: "number",
        legs: type({
          distance: "number",
          duration: "number",
        }).array(),
      }).array(),
    }),
  });
};

export function metersToMiles(meters: number): number {
  return meters / 1609.34;
}

export function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

export const useComputeDeliveryEstimation = (
  params: Partial<ComputeDeliveryEstimation>,
) => {
  const { pickupLocation, deliveryLocation, priority, products } = params;
  const queryDistanceValidation = type({
    pickupLocation: coordinateType,
    deliveryLocation: coordinateType,
  })({ pickupLocation, deliveryLocation });

  const { data: distanceData, error: distanceError } = useQuery({
    enabled: !(queryDistanceValidation instanceof type.errors),
    queryKey: [
      "fetch-shortest-path",
      pickupLocation?.latitude,
      pickupLocation?.longitude,
      deliveryLocation?.latitude,
      deliveryLocation?.longitude,
    ],
    queryFn: () => getDistance(pickupLocation!, deliveryLocation!),
    select(data) {
      const route = data.routes[0];
      return {
        distanceMeasurement: DistanceMeasurement.OSRM_FASTEST_ROUTE,
        distanceInMiles: metersToMiles(route.distance),
        durationInSeconds: route.duration,
      };
    },
  });

  const computeListOfVehiclesValidation = type({
    products: productWithQuantityType.array().atLeastLength(1),
    priority: type.valueOf(OrderPriority),
    distanceInMiles: "number",
  })({ products, priority, distanceInMiles: distanceData?.distanceInMiles });

  const {
    data: result,
    isFetching,
    error: computeError,
  } = useQuery({
    initialData: null,
    enabled: !(computeListOfVehiclesValidation instanceof type.errors),
    queryKey: [
      "calculate-vehicles",
      products,
      priority,
      distanceData?.distanceInMiles,
    ],
    queryFn: () => {
      const res = computeTheMinimumRequiredVehiclesAndFees(
        products || [],
        distanceData?.distanceInMiles || 0,
        priority || OrderPriority.STANDARD,
      );
      if (res instanceof Error) {
        throw res;
      }
      return res;
    },
    select(data) {
      const milesAndDuration = !distanceData
        ? null
        : {
            distanceInMiles: distanceData.distanceInMiles,
            durationInSeconds: distanceData.durationInSeconds,
            distanceMeasurement: distanceData.distanceMeasurement,
          };
      if (!data) return null;
      return {
        ...data,
        ...milesAndDuration,
      };
    },
  });

  return { result, isFetching, error: distanceError || computeError };
};
