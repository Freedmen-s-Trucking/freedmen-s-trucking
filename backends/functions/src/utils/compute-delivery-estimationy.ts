import { ProductWithQuantity, vehiclesInfoList, VehicleType } from '@freedmen-s-trucking/types';

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
  miles: number,
  priority: 'standard' | 'expedited' | 'urgent',
): { vehicles: { type: VehicleType; count: number }[]; cost: number } {
  const vehicles: { type: VehicleType; count: number }[] = [];
  const totalWeight = CalculateTotalWeight(packages);
  const totalVolume = CalculateTotalVolume(packages);

  let totalCost = 0;
  let remainingWeight = totalWeight;
  let remainingVolume = totalVolume;
  while (remainingWeight > 0 || remainingVolume > 0) {
    const vehicleFound = vehiclesInfoList.find(
      (v) => v.maxWeightInLbs >= remainingWeight && v.maxCapacityInCubicInches >= remainingVolume,
    );
    const vehicle = vehicleFound || vehiclesInfoList[vehiclesInfoList.length - 1];
    if (vehicle) {
      totalCost += vehicle.pricePerMile * miles;
      vehicles.push({ type: vehicle.type, count: 1 });
      remainingWeight -= vehicle.maxWeightInLbs;
      remainingVolume -= vehicle.maxCapacityInCubicInches;
    }
  }

  totalCost += (deliveryPriorityPricesAddons[priority] || 0) * miles;
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
      acc + cur.dimensions.heightInInches * cur.dimensions.widthInInches * cur.dimensions.lengthInInches * cur.quantity,
    0,
  );
}

// /**
//  * Find all combinations of vehicles that can carry the given weight and volume
//  * @param weight The weight to be carried
//  * @param volume The volume to be carried
//  * @returns An array of {vehicles: {type: VehicleType, count: number}[], cost: number}
//  */
// function FindAllCombinationsOfVehicles(weight: number, volume: number): {vehicles: {type: VehicleType, count: number}[], cost: number}[] {
//   const combinations: {vehicles: {type: VehicleType, count: number}[], cost: number}[] = [];
//   const recursion = (vehicles: {type: VehicleType, count: number}[], weight: number, volume: number) => {
//     if (weight === 0 && volume === 0) {
//       const cost = vehicles.reduce((acc, cur) => acc + cur.count * vehiclesInfo.find(v => v.type === cur.type)!.pricePerMile, 0);
//       combinations.push({vehicles, cost});
//       return;
//     }
//     vehiclesInfo.forEach((vehicle) => {
//       if (weight >= vehicle.maxWeightInLbs && volume >= vehicle.maxCapacityInCubicInches) {
//         const newVehicles = [...vehicles, {type: vehicle.type, count: 1}];
//         recursion(newVehicles, weight - vehicle.maxWeightInLbs, volume - vehicle.maxCapacityInCubicInches);
//       }
//     });
//   };
//   recursion([], weight, volume);
//   return combinations;
// }

// /**
//  * Find the cheapest combination of vehicles
//  * @param combinations The array of combinations of vehicles
//  * @param miles The distance in miles
//  * @returns The cheapest combination of vehicles
//  */
// function FindCheapestCombination(combinations: {vehicles: {type: VehicleType, count: number}[], cost: number}[], miles: number): {type: VehicleType, count: number}[] {
//   return combinations.reduce((acc, cur) => cur.cost * miles < acc.cost * miles ? cur.vehicles : acc.vehicles, combinations[0].vehicles);
// }
