import { VehicleInfo } from "./types.js";

export const vehiclesInfoList: VehicleInfo[] = [
  {
    type: "SEDAN",
    pricePerMile: 1.5,
    maxCapacityInCubicInches: 14 * 60 * 40,
    maxWeightInLbs: 1000,
  },
  {
    type: "SUV",
    pricePerMile: 2.25,
    maxCapacityInCubicInches: 40 * 60 * 40,
    maxWeightInLbs: 2000,
  },
  {
    type: "VAN",
    pricePerMile: 2.25,
    maxCapacityInCubicInches: 70 * 60 * 40,
    maxWeightInLbs: 3000,
  },
  {
    type: "TRUCK",
    pricePerMile: 3.0,
    maxCapacityInCubicInches: 96 * 96 * 96,
    maxWeightInLbs: 5000,
  },
  {
    type: "FREIGHT",
    pricePerMile: 4.5,
    maxCapacityInCubicInches: 53 * 102 * 102,
    maxWeightInLbs: 10000,
  },
];
