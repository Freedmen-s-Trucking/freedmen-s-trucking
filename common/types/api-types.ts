// import { type } from "arktype";

import {
  LocationEntity,
  OrderEntityFields,
  OrderPriority,
  ProductEntity,
} from "./entities";

// const packageInfo = type({
//   name: "string",
//   weightInLbs: "number",
//   heightInInches: "number",
//   widthInInches: "number",
//   lengthInInches: "number",
// });

// export const computeDeliveryEstimation = type({
//   packages: [packageInfo],
//   source: {
//     latitude: "number",
//     longitude: "number",
//   },
//   destination: {
//     latitude: "number",
//     longitude: "number",
//   },
// });

// export type ComputeDeliveryEstimation = typeof computeDeliveryEstimation.infer;

export type ApiComputeDeliveryEstimation = {
  [OrderEntityFields.products]: ProductEntity[];
  [OrderEntityFields.pickupLocation]: Omit<LocationEntity, "address">;
  [OrderEntityFields.deliveryLocation]: Omit<LocationEntity, "address">;
  [OrderEntityFields.priority]: OrderPriority;
};
