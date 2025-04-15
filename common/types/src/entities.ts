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
  authenticateAccessCode: "string",
  consents: type({
    isBackgroundDisclosureAccepted: "boolean",
    GLBPurposeAndDPPAPurpose: "boolean",
    FCRAPurpose: "boolean",
  }).optional(),
  firstName: "string",
  lastName: "string",
  email: "string | null",
  phoneNumber: "string | null",
  photoURL: "string | null",
  birthDate: dateStringOrTimestampType.optional(),
  uploadedProfileStoragePath: type("string | null").optional(),
  isEmailVerified: "boolean",
  isPhoneNumberVerified: "boolean",
  isAdmin: type("boolean").optional(),
  isDriver: type("boolean").optional(),
  authMethods: authMethodType.array(),
  createdAt: dateStringOrTimestampType.optional(),
  updatedAt: dateStringOrTimestampType.optional(),
});
export type UserEntity = typeof userEntity.infer;

//userEntity /*.partial()*/
export const driverEntity = userEntity.and({
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
  withdrawalHistory: withdrawalEntity.array(),
  payoutMethods: payoutMethodType.array(),
  payoutCapabilities: type({
    transfers: "'active' | 'inactive' | 'pending'",
  }).optional(),
  verificationStatus: verificationStatus,
  verificationMessage: "string | null",
  stripeConnectAccountId: "string | null",
  authenticateAccessCode: "string",
  currentEarnings: "number | null",
  totalEarnings: "number | null",
  tasksCompleted: "number | null",
  activeTasks: "number | null",
});
export type DriverEntity = typeof driverEntity.infer;

export const platformSettingsEntity = type({
  availableCities: placeLocationType.array().or("null"),
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
}

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
  distanceInMiles = "distanceInMiles",
  distanceMeasurement = "distanceMeasurement",
  driverId = "driverId",
  createdAt = "createdAt",
  deliveryFee = "deliveryFee",
  updatedAt = "updatedAt",
  paymentRef = "paymentRef",
  driverName = "driverName",
  driverEmail = "driverEmail",
  driverPhone = "driverPhone",
  unassignedVehiclesTypes = "unassignedVehiclesTypes",
  unassignedVehicles = "unassignedVehicles",
  assignedDriverIds = "assignedDriverIds",
  deliveryScreenshotPath = "deliveryScreenshotPath",
  driverPositions = "driverPositions",
  payoutPaymentRef = "payoutPaymentRef",
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

const taskEntity = type({
  [OrderEntityFields.driverId]: "string",
  [OrderEntityFields.driverName]: "string",
  [OrderEntityFields.driverEmail]: "string",
  [OrderEntityFields.driverPhone]: "string",
  [OrderEntityFields.deliveryFee]: "number",
  [OrderEntityFields.payoutPaymentRef]: type("string").optional(),
  [OrderEntityFields.driverStatus]: type.valueOf(DriverOrderStatus),
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
  [OrderEntityFields.unassignedVehiclesTypes]: vehicleType.array(),
  [OrderEntityFields.unassignedVehicles]: type({
    deliveryFees: "number",
  }).array(),
  [OrderEntityFields.assignedDriverIds]: "string[]",
  "+": "ignore",
});
type TaskMap = {
  [key: `task-${string}`]: typeof taskEntity.infer;
};
export type OrderEntity = TaskMap & typeof orderEntity.infer;

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
