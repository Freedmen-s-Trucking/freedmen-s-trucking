import { type } from "arktype";

export { type };

export const payoutMethodType = type({
  id: "string",
  type: "'bank_account' | 'card'",
  status: type("string | null").optional(), // `new`, `validated`, `verified`, `verification_failed`, or `errored`
  name: "string | null",
});
export type PaymentMethod = typeof payoutMethodType.infer;

export const authMethodType = type({
  provider: "string",
  providerRowData: type({
    "[string]": "unknown",
  }),
});
export type AuthMethod = typeof authMethodType.infer;

export const productType = type({
  name: "string",
  dimensions: {
    widthInInches: "number > 0",
    heightInInches: "number > 0",
    lengthInInches: "number > 0",
  },
  weightInLbs: "number > 0",
});
export type Product = typeof productType.infer;

export const productWithQuantityType = productType.and({
  quantity: "number > 0",
});
export type ProductWithQuantity = typeof productWithQuantityType.infer;

export const locationType = type({
  address: "string",
  latitude: "number",
  longitude: "number",
});
export type Location = typeof locationType.infer;

export const dateStringOrTimestampType = type("string.date")
  .or(
    type({
      seconds: "number",
      nanoseconds: "number",
    })
  )
  .or("null");
export type DateStringOrTimestamp = typeof dateStringOrTimestampType.infer;

export const coordinateType = locationType.omit("address");
export type Coordinate = typeof coordinateType.infer;

export const placeLocationType = locationType.and({
  placeId: "string",
  viewPort: {
    low: coordinateType,
    high: coordinateType,
  },
});
export type PlaceLocation = typeof placeLocationType.infer;
export type MinPlaceLocation = Omit<
  PlaceLocation,
  "viewPort" | "longitude" | "latitude"
>;
export const vehicleType = type(
  "'SEDAN' | 'SUV' | 'VAN' | 'TRUCK' | 'FREIGHT'"
);
export type VehicleType = typeof vehicleType.infer;

export const vehicleInfoType = type({
  type: vehicleType,
  pricePerMile: "number",
  avgCapacityInCubicInches: "number",
  avgCapacityInCubicFeet: "number",
  avgWeightInLbs: "number",
});
export type VehicleInfo = typeof vehicleInfoType.infer;

export const verificationStatus = type("'pending' | 'verified' | 'failed'");
export type VerificationStatus = typeof verificationStatus.infer;

export const accountTypeType = type("'driver' | 'customer' | 'admin'");
export type AccountType = typeof accountTypeType.infer;

export type EntityWithPath<T> = { path: string; data: T };
export type EntityWithID<T> = { id: string; data: T };
