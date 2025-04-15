import { OrderPriority } from "./entities.js";
import { VehicleInfo } from "./types.js";

/**
 * Default platform fee percent to apply on each order.
 */
export const defaultPlatformFeePercent = 6;

/**
 * Base platform fee to apply on each order.
 */
export const basePlatformFeeInUSD = 4.99;

/**
 * Delivery priority prices addons.
 */
export const deliveryPriorityPricesAddons: Record<OrderPriority, number> = {
  standard: 0,
  expedited: 1,
  urgent: 1.5,
} as const;

/**
 * List of vehicles available for delivery, ordered by price per mile.
 */
export const vehiclesInfoList: VehicleInfo[] = [
  {
    type: "SEDAN",
    pricePerMile: 1.5,
    avgCapacityInCubicInches: 15 * 1728,
    avgCapacityInCubicFeet: 15,
    avgWeightInLbs: 500,
  },
  {
    type: "SUV",
    pricePerMile: 2.25,
    avgCapacityInCubicInches: 55 * 1728,
    avgCapacityInCubicFeet: 55,
    avgWeightInLbs: 1500,
  },
  {
    type: "VAN",
    pricePerMile: 2.25,
    avgCapacityInCubicInches: 200 * 1728,
    avgCapacityInCubicFeet: 200,
    avgWeightInLbs: 3500,
  },
  {
    type: "TRUCK",
    pricePerMile: 3.0,
    avgCapacityInCubicInches: 1000 * 1728,
    avgCapacityInCubicFeet: 1000,
    avgWeightInLbs: 7000,
  },
  {
    type: "FREIGHT",
    pricePerMile: 4.5,
    avgCapacityInCubicInches: 4000 * 1728,
    avgCapacityInCubicFeet: 4000,
    avgWeightInLbs: 44000,
  },
];

export enum CollectionName {
  DRIVERS = "drivers",
  ORDERS = "orders",
  PAYMENTS = "payments",
  PLATFORM_OVERVIEW = "platformOverviews",
  PLATFORM_SETTINGS = "platformSettings",
  USERS = "users",
}

export const LATEST_PLATFORM_OVERVIEW_PATH = `${CollectionName.PLATFORM_OVERVIEW}/latest`;
export const LATEST_PLATFORM_SETTINGS_PATH = `${CollectionName.PLATFORM_SETTINGS}/latest`;
