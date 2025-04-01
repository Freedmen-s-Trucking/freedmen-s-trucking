import { type } from "arktype";

import { newOrderEntity, OrderPriority } from "./entities.js";
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
