import { type } from "arktype";

import {
  driverEntity,
  newOrderEntity,
  OrderEntityFields,
  OrderPriority,
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
  metadata: newOrderEntity.omit(OrderEntityFields.ownerId),
});

export type ApiResScheduleDeliveryIntent =
  typeof apiResScheduleDeliveryIntent.infer;

export type ApiReqScheduleDeliveryIntent =
  typeof apiReqScheduleDeliveryIntent.infer;

export const apiResSetupConnectedAccount = driverEntity
  .pick("stripeConnectAccountId")
  .and({
    returnUrl: "string.url",
    refreshUrl: "string.url",
  });

export type ApiResSetupConnectedAccount =
  typeof apiResSetupConnectedAccount.infer;

export const apiReqExtractOrderRequestFromText = type({
  text: type("string").atLeastLength(1),
  threadId: "string | null?",
  chatId: "string | null?",
});

export type ApiReqExtractOrderRequestFromText =
  typeof apiReqExtractOrderRequestFromText.infer;

export const apiResExtractOrderRequestFromText = type({
  data: {
    order: type({
      pickupLocation: {
        address: "string",
        placeId: "string",
      },
      dropoffLocation: {
        address: "string",
        placeId: "string",
      },
      items: type({
        name: "string",
        estimatedDimensions: {
          widthInInches: "number",
          heightInInches: "number",
          lengthInInches: "number",
        },
        estimatedWeightInLbsPerUnit: "number",
        quantity: "number",
      }).array(),
      urgencyLevel: type.valueOf(OrderPriority).or("''"),
      deliveryTime: "string | ''",
    }).partial(),
    onboarding: {
      status: "'in_progress' | 'completed'",
      pendingQuestion: type({
        type: "'open_text' | 'boolean' | 'select'",
        field: "string",
        question: "string",
        exampleAnswer: "string?",
        boolean_options: type("string[]").optional(),
        options: type({
          id: "string",
          displayValue: "string",
        })
          .array()
          .optional(),
      }).optional(),
      answeredFields: "string[]",
      systemNotes: "string?",
    },
  },
  chatId: "string",
  threadId: "string",
});

export type ApiResExtractOrderRequestFromText =
  typeof apiResExtractOrderRequestFromText.infer;

export const apiReqProcessIdentityVerificationWithAuthenticate = type({
  medallion: type({
    redirectURL: "string.url?",
  }).optional(),
  user: type({
    firstName: "string",
    middleName: "string?",
    lastName: "string",
    dob: "string.date.iso",
    phone: "string?",
    email: "string.email",
    houseNumber: "string?",
    streetName: "string?",
    city: "string?",
    country: "string?",
    ssn: "string?",
    zipCode: "number?",
    state: "string?",
  }),
  consents: type({
    isBackgroundDisclosureAccepted: "boolean",
    GLBPurposeAndDPPAPurpose: "boolean",
    FCRAPurpose: "boolean",
  }),
}).partial();

export type ApiReqProcessIdentityVerificationWithAuthenticate =
  typeof apiReqProcessIdentityVerificationWithAuthenticate.infer;

export const apiResProcessIdentityVerificationWithAuthenticate = driverEntity
  .pick("authenticateAccessCode")
  .and({
    jwt: "string",
    token: "string",
    processVerificationUrl: "string.url",
  });

export type ApiResProcessIdentityVerificationWithAuthenticate =
  typeof apiResProcessIdentityVerificationWithAuthenticate.infer;
