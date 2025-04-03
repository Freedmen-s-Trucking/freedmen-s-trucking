import {
  ComputeDeliveryEstimation,
  Coordinate,
  coordinateType,
  OrderPriority,
  productWithQuantityType,
  RequiredVehicleEntity,
  type,
} from "@freedmen-s-trucking/types";
import { useQuery } from "@tanstack/react-query";
import { up } from "up-fetch";

import {
  ProductWithQuantity,
  vehiclesInfoList,
} from "@freedmen-s-trucking/types";

const deliveryPriorityPricesAddons = {
  standard: 0,
  expedited: 1,
  urgent: 1.5,
} as const;

/**
 * Calculate the minimum number of vehicles needed to deliver the packages
 * @param packages The array of packages to be delivered
 * @returns The array of vehicles needed to deliver the packages
 */
export function calculateTheCheapestCombinationOfVehicles(
  packages: ProductWithQuantity[],
  distanceInMiles: number,
  priority: "standard" | "expedited" | "urgent",
): { vehicles: RequiredVehicleEntity[]; cost: number } {
  const vehicles: RequiredVehicleEntity[] = [];
  const totalWeight = CalculateTotalWeight(packages);
  const totalVolume = CalculateTotalVolume(packages);

  let totalCost = 0;
  let remainingWeight = totalWeight;
  let remainingVolume = totalVolume;
  while (remainingWeight > 0 || remainingVolume > 0) {
    const vehicleFound = vehiclesInfoList.find(
      (v) =>
        v.maxWeightInLbs >= remainingWeight &&
        v.maxCapacityInCubicInches >= remainingVolume,
    );
    const vehicle =
      vehicleFound || vehiclesInfoList[vehiclesInfoList.length - 1];
    if (vehicle) {
      totalCost += vehicle.pricePerMile * distanceInMiles;
      vehicles.push({ type: vehicle.type, quantity: 1 });
      remainingWeight -= vehicle.maxWeightInLbs;
      remainingVolume -= vehicle.maxCapacityInCubicInches;
    }
  }

  totalCost += (deliveryPriorityPricesAddons[priority] || 0) * distanceInMiles;
  return { vehicles, cost: totalCost };
}

/**
 * Calculate the total weight of the packages
 * @param packages The array of packages
 * @returns The total weight in lbs
 */
function CalculateTotalWeight(packages: ProductWithQuantity[]): number {
  return packages.reduce((acc, cur) => acc + cur.weightInLbs * cur.quantity, 0);
}

/**
 * Calculate the total volume of the packages
 * @param packages The array of packages
 * @returns The total volume in cubic inches
 */
function CalculateTotalVolume(packages: ProductWithQuantity[]): number {
  return packages.reduce(
    (acc, cur) =>
      acc +
      cur.dimensions.heightInInches *
        cur.dimensions.widthInInches *
        cur.dimensions.lengthInInches *
        cur.quantity,
    0,
  );
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
    queryFn: () =>
      calculateTheCheapestCombinationOfVehicles(
        products || [],
        distanceData?.distanceInMiles || 0,
        priority || "standard",
      ),
    select(data) {
      const milesAndDuration = !distanceData
        ? null
        : {
            distanceInMiles: distanceData.distanceInMiles,
            durationInSeconds: distanceData.durationInSeconds,
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
