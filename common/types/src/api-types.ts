import { type } from "arktype";

import {
  driverEntity,
  newOrderEntity,
  OrderPriority,
  userEntity,
} from "./entities.js";
import { coordinateType, productWithQuantityType } from "./types.js";

export const computeDeliveryEstimation = type({
  products: productWithQuantityType.array().atLeastLength(1),
  pickupLocation: coordinateType,
  deliveryLocation: coordinateType,
  priority: type.valueOf(OrderPriority),
});

export type ComputeDeliveryEstimation = typeof computeDeliveryEstimation.infer;

export const apiResScheduleDeliveryIntent = type({
  clientSecret: "string",
});

export const apiReqScheduleDeliveryIntent = type({
  metadata: newOrderEntity,
});

export type ApiResScheduleDeliveryIntent =
  typeof apiResScheduleDeliveryIntent.infer;

export type ApiReqScheduleDeliveryIntent =
  typeof apiReqScheduleDeliveryIntent.infer;

export const apiResSetupConnectedAccount = userEntity
  .pick("uid", "email")
  .and(driverEntity.pick("stripeConnectAccountId"))
  .and({
    returnUrl: "string.url",
    refreshUrl: "string.url",
  });

export type ApiResSetupConnectedAccount =
  typeof apiResSetupConnectedAccount.infer;

export const apiReqExtractOrderRequestFromText = type({
  text: type("string").atLeastLength(4),
});

export type ApiReqExtractOrderRequestFromText =
  typeof apiReqExtractOrderRequestFromText.infer;

export const apiResExtractOrderRequestFromText = type({
  pickupLocation: "string",
  dropoffLocation: "string",
  items: productWithQuantityType.array().atLeastLength(1),
  urgencyLevel: type.valueOf(OrderPriority),
  deliveryTime: "string",
});

export const ApiResExtractOrderRequestFromTextSchema =
  apiResExtractOrderRequestFromText.toJsonSchema();
export type ApiResExtractOrderRequestFromText =
  typeof apiResExtractOrderRequestFromText.infer;
