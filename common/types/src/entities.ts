import {
  authMethodType,
  placeLocationType,
  locationType,
  payoutMethodType,
  productWithQuantityType,
  type,
  vehicleType,
  verificationStatus,
  coordinateType,
  dateStringOrTimestampType,
} from "./types.js";

export const withdrawalEntity = type({
  id: "string",
  amount: "number",
  date: "string",
  status: "'pending' | 'completed' | 'failed'",
});
export type WithdrawalEntity = typeof withdrawalEntity.infer;

export const userEntity = type({
  uid: "string",
  displayName: "string",
  firstName: "string",
  lastName: "string",
  email: "string | null",
  phoneNumber: "string | null",
  birthDate: dateStringOrTimestampType.optional(),
  photoURL: "string | null",
  uploadedProfileStoragePath: type("string | null").optional(),
  isEmailVerified: "boolean",
  isPhoneNumberVerified: "boolean",
  isAdmin: type("boolean").optional(),
  isDriver: type("boolean").optional(),
  authMethods: authMethodType.array(),
  createdAt: dateStringOrTimestampType.optional(),
  updatedAt: dateStringOrTimestampType.optional(),
  fcmTokenMap: type("Record<string, string>").optional(),
});
export type UserEntity = typeof userEntity.infer;

//userEntity /*.partial()*/
export const driverEntity = userEntity.and({
  authenticateAccessCode: "string?",
  consents: type({
    isBackgroundDisclosureAccepted: "boolean",
    GLBPurposeAndDPPAPurpose: "boolean",
    FCRAPurpose: "boolean",
  }).optional(),
  driverInsuranceVerificationStatus: verificationStatus,
  driverInsuranceStoragePath: "string | null",
  driverInsuranceVerificationIssues: "string[]",
  driverLicenseFrontStoragePath: "string | null",
  driverLicenseBackStoragePath: "string | null",
  driverLicenseVerificationStatus: verificationStatus.or("null"),
  driverLicenseVerificationIssues: "string[] | null",
  location: locationType.or("null").optional(),
  vehicles: type({
    type: vehicleType,
    insuranceStoragePath: type("string | null").optional(),
    insuranceVerificationStatus: verificationStatus.optional(),
    insuranceVerificationIssues: type("string[] | null").optional(),
  })
    .array()
    .optional(),
  withdrawalHistory: withdrawalEntity.array().optional(),
  payoutMethods: payoutMethodType.array().optional(),
  payoutCapabilities: type({
    transfers: "'active' | 'inactive' | 'pending'",
  }).optional(),
  verificationStatus: verificationStatus,
  sevenYearBackgroundCheck: type("'clear' | 'recordFound' | null").optional(),
  verificationMessage: "string | null",
  stripeConnectAccountId: "string | null",
  currentEarnings: "number | null",
  totalEarnings: "number | null",
  tasksCompleted: "number | null",
  activeTasks: "number | null",
  latestLocation: coordinateType
    .and({
      timestamp: dateStringOrTimestampType,
      geoHash: "string?",
    })
    .optional(),
});
export type DriverEntity = typeof driverEntity.infer;

export const platformSettingsEntity = type({
  availableCities: placeLocationType.array().or("null"),
  taskAssignmentConfig: {
    maxDriverRadiusInMeters: "number",
    pickupsGroupDistanceInMeters: "number",
    dropoffsGroupsDistanceInMeters: "number",
    maxOrdersPerGroup: "number",
  },
  updatedAt: dateStringOrTimestampType.optional(),
  "+": "delete",
});
export type PlatformSettingsEntity = typeof platformSettingsEntity.infer;

export const platformOverviewEntity = type({
  updatedAt: dateStringOrTimestampType.optional(),
  createdAt: dateStringOrTimestampType.optional(),
  totalEarnings: "number | null",
  totalCompletedOrders: "number | null",
  totalActiveOrders: "number | null",
  totalVerifiedDrivers: "number | null",
  totalPendingVerificationDrivers: "number | null",
  totalFailedVerificationDrivers: "number | null",
  totalCustomers: "number | null",
  totalPayout: "number | null",
});
export type PlatformOverviewEntity = typeof platformOverviewEntity.infer;

export const adminEntity = type({
  parentAdmin: "string | null",
});
export type AdminEntity = typeof adminEntity.infer;

export const requiredVehicleEntity = type({
  type: vehicleType,
  quantity: "number",
  fees: "number",
  weightToBeUsedInLbs: "number[]",
});

export type RequiredVehicleEntity = typeof requiredVehicleEntity.infer;

export const notificationEntity = type({
  id: "string",
  type: "'order' | 'system'",
  message: "string",
  read: "boolean",
  targetType: "'customer' | 'driver'",
  targetId: "string",
  createdAt: dateStringOrTimestampType.optional(),
  updatedAt: dateStringOrTimestampType.optional(),
});
export type NotificationEntity = typeof notificationEntity.infer;

export enum OrderStatus {
  PAYMENT_RECEIVED = "payment-received",
  TASKS_ASSIGNED = "tasks-assigned",
  COMPLETED = "completed",
}

export enum TaskGroupStatus {
  IDLE = "idle",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
}

export enum DriverOrderStatus {
  WAITING = "waiting",
  ACCEPTED = "accepted",
  ON_THE_WAY_TO_PICKUP = "on-the-way-to-pickup",
  ON_THE_WAY_TO_DELIVER = "on-the-way-to-deliver",
  DELIVERED = "delivered",
}

export enum OrderPriority {
  STANDARD = "standard",
  EXPEDITED = "expedited",
  URGENT = "urgent",
}

export enum DistanceMeasurement {
  OSRM_FASTEST_ROUTE = "osrm-fastest-route",
  GOOGLE_DISTANCE_MATRIX = "google-distance-matrix",
}

export enum TempOrderEntityFields {
  authId = "authId",
  history = "history",
}

const chatCompletionContent = type({
  type: "'text'",
  text: "string",
})
  .array()
  .or("string");
export const tempOrderEntity = type({
  // [TempOrderEntityFields.authId]: "string",
  [TempOrderEntityFields.history]: type({
    role: "'developer' | 'user'",
    name: "string?",
    content: chatCompletionContent,
  })
    .or({
      role: "'tool'",
      tool_call_id: "string",
      content: chatCompletionContent,
    })
    .or({
      role: "'assistant'",
      audio: type("null").or({ id: "string" }).optional(),
      name: "string?",
      tool_calls: type({
        type: "'function'",
        id: "string",
        function: type({
          name: "string",
          arguments: "string",
        }),
      })
        .array()
        .optional(),
      refusal: type("string | null").optional(),
      content: chatCompletionContent
        .or(
          type({
            type: "'refusal'",
            refusal: "string",
          }).array()
        )
        .or("null")
        .optional(),
    })
    .array(),
});
export type TempOrderEntity = typeof tempOrderEntity.infer;

export enum OrderPrivateDetailsEntityFields {
  deliveryCode = "deliveryCode",
}
export const orderPrivateDetailsEntity = type({
  [OrderPrivateDetailsEntityFields.deliveryCode]: "string",
});
export type OrderPrivateDetailsEntity = typeof orderPrivateDetailsEntity.infer;

export enum OrderEntityFields {
  clientName = "clientName",
  clientEmail = "clientEmail",
  clientPhone = "clientPhone",
  ownerId = "ownerId",
  pickupLocation = "pickupLocation",
  deliveryLocation = "deliveryLocation",
  requiredVehicles = "requiredVehicles",
  priceInUSD = "priceInUSD",
  products = "products",
  priority = "priority",
  status = "status",
  driverStatus = "driverStatus",
  driverConfirmationCode = "driverConfirmationCode",
  deliveredOrderConfirmationImage = "deliveredOrderConfirmationImage",
  distanceInMiles = "distanceInMiles",
  distanceMeasurement = "distanceMeasurement",
  driverId = "driverId",
  createdAt = "createdAt",
  photoURL = "photoURL",
  uploadedProfileStoragePath = "uploadedProfileStoragePath",
  deliveryFee = "deliveryFee",
  updatedAt = "updatedAt",
  paymentRef = "paymentRef",
  driverName = "driverName",
  driverEmail = "driverEmail",
  driverPhone = "driverPhone",
  // unassignedVehiclesTypes = "unassignedVehiclesTypes",
  // unassignedVehicles = "unassignedVehicles",
  // assignedDriverIds = "assignedDriverIds",
  assignedDriverId = "assignedDriverId",
  deliveryScreenshotPath = "deliveryScreenshotPath",
  driverPositions = "driverPositions",
  payoutPaymentRef = "payoutPaymentRef",
  task = "task",
}
export const newOrderEntity = type({
  [OrderEntityFields.ownerId]: "string",
  [OrderEntityFields.pickupLocation]: locationType,
  [OrderEntityFields.deliveryLocation]: locationType,
  [OrderEntityFields.requiredVehicles]: requiredVehicleEntity.array(),
  [OrderEntityFields.priceInUSD]: "number",
  [OrderEntityFields.products]: productWithQuantityType.array(),
  [OrderEntityFields.priority]: type.valueOf(OrderPriority),
  [OrderEntityFields.distanceInMiles]: "number",
  [OrderEntityFields.distanceMeasurement]: type.valueOf(DistanceMeasurement),
});
export type NewOrder = typeof newOrderEntity.infer;

const orderTaskType = type({
  [OrderEntityFields.driverId]: "string",
  [OrderEntityFields.driverName]: "string",
  [OrderEntityFields.driverEmail]: "string",
  [OrderEntityFields.photoURL]: "string | null",
  [OrderEntityFields.uploadedProfileStoragePath]: type("string | null").optional(),
  [OrderEntityFields.driverPhone]: "string",
  [OrderEntityFields.deliveryFee]: "number",
  [OrderEntityFields.payoutPaymentRef]: type("string").optional(),
  [OrderEntityFields.driverStatus]: type.valueOf(DriverOrderStatus),
  [OrderEntityFields.driverConfirmationCode]: "string | null ?",
  [OrderEntityFields.deliveredOrderConfirmationImage]: "string | null ?",
  [OrderEntityFields.createdAt]: dateStringOrTimestampType.optional(),
  [OrderEntityFields.updatedAt]: dateStringOrTimestampType.optional(),
  [OrderEntityFields.driverPositions]: type({
    [DriverOrderStatus.ACCEPTED]: coordinateType,
    [DriverOrderStatus.ON_THE_WAY_TO_PICKUP]: coordinateType,
    [DriverOrderStatus.ON_THE_WAY_TO_DELIVER]: coordinateType,
    [DriverOrderStatus.DELIVERED]: coordinateType,
  }).optional(),
  [OrderEntityFields.deliveryScreenshotPath]: "string | null",
});
export const orderEntity = newOrderEntity.merge({
  [OrderEntityFields.clientName]: "string",
  [OrderEntityFields.clientEmail]: "string",
  [OrderEntityFields.clientPhone]: "string",
  [OrderEntityFields.status]: type.valueOf(OrderStatus),
  [OrderEntityFields.createdAt]: dateStringOrTimestampType.optional(),
  [OrderEntityFields.updatedAt]: dateStringOrTimestampType.optional(),
  [OrderEntityFields.paymentRef]: "string",
  // [OrderEntityFields.unassignedVehiclesTypes]: vehicleType.array(),
  // [OrderEntityFields.unassignedVehicles]: type({
  //   deliveryFees: "number",
  // }).array(),
  // [OrderEntityFields.assignedDriverIds]: "string[]",
  [OrderEntityFields.assignedDriverId]: "string | null",
  [OrderEntityFields.task]: orderTaskType.optional(),
});
// type TaskMap = {
//   [key: `task-${string}`]: typeof taskEntity.infer;
// };
export type OrderEntity = /*TaskMap & */ typeof orderEntity.infer;

export enum TaskGroupEntityFields {
  driverId = "driverId",
  orderIds = "orderIds",
  orderIdValueMap = "orderIdValueMap",
  status = "status",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  pickupCenterCoordinate = "pickupCenterCoordinate",
  dropoffCenterCoordinate = "dropoffCenterCoordinate",
  pickupCenterGeoHash = "pickupCenterGeoHash",
  dropoffCenterGeoHash = "dropoffCenterGeoHash",
}
export const taskGroupEntity = type({
  [TaskGroupEntityFields.driverId]: "string | null",
  [TaskGroupEntityFields.orderIds]: "string[]",
  [TaskGroupEntityFields.orderIdValueMap]: {
    "[string]": orderEntity
      .omit(
        OrderEntityFields.task,
        OrderEntityFields.assignedDriverId,
        OrderEntityFields.status
      )
      .merge({
        "+": "delete",
      }),
  },
  [TaskGroupEntityFields.status]: type.valueOf(TaskGroupStatus),
  [TaskGroupEntityFields.createdAt]: dateStringOrTimestampType,
  [TaskGroupEntityFields.updatedAt]: dateStringOrTimestampType,
  [TaskGroupEntityFields.pickupCenterCoordinate]: coordinateType,
  [TaskGroupEntityFields.pickupCenterGeoHash]: "string",
  [TaskGroupEntityFields.dropoffCenterCoordinate]: coordinateType,
  [TaskGroupEntityFields.dropoffCenterGeoHash]: "string",
  "+": "delete",
});

export type TaskGroupEntity = typeof taskGroupEntity.infer;

export enum PaymentEntityFields {
  paymentIntentId = "paymentIntentId",
  type = "type",
  status = "status",
  amountInUSD = "amountInUSD",
  provider = "provider",
  from = "from",
  to = "to",
  fee = "fee",
  receivedAmount = "receivedAmount",
  date = "date",
}

export enum PaymentType {
  INCOME = "income",
  PAYOUT = "payout",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
}

export enum PaymentProvider {
  STRIPE = "stripe",
}

export enum PaymentActorType {
  PLATFORM = "platform",
  DRIVER = "driver",
  CUSTOMER = "customer",
}

export const paymentActor = type({
  id: "string",
  name: "string",
  type: type.valueOf(PaymentActorType),
});

export const paymentEntity = type({
  [PaymentEntityFields.type]: type.valueOf(PaymentType),
  [PaymentEntityFields.status]: type.valueOf(PaymentStatus),
  [PaymentEntityFields.amountInUSD]: "number",
  [PaymentEntityFields.provider]: type({
    name: type.valueOf(PaymentProvider),
    ref: "string",
  }),
  [PaymentEntityFields.from]: paymentActor,
  [PaymentEntityFields.to]: paymentActor,
  [PaymentEntityFields.fee]: "number | null",
  [PaymentEntityFields.receivedAmount]: "number | null",
  [PaymentEntityFields.date]: dateStringOrTimestampType.optional(),
});
export type PaymentEntity = typeof paymentEntity.infer;

export enum WaitlistType {
  DRIVER = "driver",
  ORDERER = "orderer",
}

export const waitlistEntity = type({
  name: "string",
  email: "string",
  phone: "string",
  location: locationType,
  type: type.valueOf(WaitlistType),
  vehicles: requiredVehicleEntity.array().optional(),
  createdAt: dateStringOrTimestampType.optional(),
  notes: "string | null",
});
export type WaitlistEntity = typeof waitlistEntity.infer;
