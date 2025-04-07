import {
  authMethodType,
  placeLocationType,
  locationType,
  paymentMethodType,
  productWithQuantityType,
  type,
  vehicleType,
  verificationStatus,
} from "./types.js";

export const withdrawalEntity = type({
  id: "string",
  amount: "number",
  date: "string",
  status: "'pending' | 'completed' | 'failed'",
});
export type WithdrawalEntity = typeof withdrawalEntity.infer;
export const timestampType = type({
  seconds: "number",
  nanoseconds: "number",
});
export type TimestampType = typeof timestampType.infer;

export const userEntity = type({
  uid: "string",
  displayName: "string",
  authenticateAccessCode: "string",
  firstName: "string",
  lastName: "string",
  email: "string | null",
  phoneNumber: "string | null",
  photoURL: "string | null",
  birthDate: type("string | null").or(timestampType),
  uploadedProfileStoragePath: type("string | null").optional(),
  isEmailVerified: "boolean",
  isPhoneNumberVerified: "boolean",
  isAdmin: type("boolean").optional(),
  isDriver: type("boolean").optional(),
  authMethods: authMethodType.array(),
  createdAt: type("string | null").or(timestampType),
  updatedAt: type("string | null").or(timestampType),
});
export type UserEntity = typeof userEntity.infer;

export const driverEntity = type({
  driverInsuranceVerificationStatus: verificationStatus,
  driverInsuranceStoragePath: "string | null",
  driverInsuranceVerificationIssues: "string[]",
  driverLicenseFrontStoragePath: "string | null",
  driverLicenseBackStoragePath: "string | null",
  driverLicenseVerificationStatus: verificationStatus.or("null"),
  driverLicenseVerificationIssues: "string[] | null",
  location: locationType.optional(),
  vehicles: type({
    type: vehicleType,
    insuranceStoragePath: type("string | null").optional(),
    insuranceVerificationStatus: verificationStatus.optional(),
    insuranceVerificationIssues: type("string[] | null").optional(),
  })
    .array()
    .optional(),
  withdrawalHistory: withdrawalEntity.array(),
  paymentMethods: paymentMethodType.array(),
  verificationStatus: verificationStatus,
  verificationMessage: "string | null",
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
  updatedAt: type("string | null").or(
    type({
      seconds: "number",
      nanoseconds: "number",
    })
  ),
  createdAt: type("string | null").or(
    type({
      seconds: "number",
      nanoseconds: "number",
    })
  ),
  totalEarnings: "number | null",
  totalCompletedOrders: "number | null",
  totalActiveOrders: "number | null",
  totalUnassignedOrders: "number | null",
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
});
export type RequiredVehicleEntity = typeof requiredVehicleEntity.infer;

export const notificationEntity = type({
  id: "string",
  type: "'order' | 'system'",
  message: "string",
  read: "boolean",
  targetType: "'customer' | 'driver'",
  targetId: "string",
  createdAt: type("string | null").or(
    type({
      seconds: "number",
      nanoseconds: "number",
    })
  ),
  updatedAt: type("string | null").or(
    type({
      seconds: "number",
      nanoseconds: "number",
    })
  ),
});
export type NotificationEntity = typeof notificationEntity.infer;

export enum OrderStatus {
  PENDING_PAYMENT = "pending-payment",
  PAYMENT_RECEIVED = "payment-received",
  ASSIGNED_TO_DRIVER = "assigned-to-driver",
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
  driverId = "driverId",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  paymentRef = "paymentRef",
  driverName = "driverName",
  driverEmail = "driverEmail",
  driverPhone = "driverPhone",
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
});
export type NewOrder = typeof newOrderEntity.infer;

export const orderEntity = newOrderEntity.merge({
  [OrderEntityFields.clientName]: "string",
  [OrderEntityFields.clientEmail]: "string",
  [OrderEntityFields.clientPhone]: "string",
  [OrderEntityFields.status]: type.valueOf(OrderStatus),
  [OrderEntityFields.driverStatus]: type.valueOf(DriverOrderStatus),
  [OrderEntityFields.driverId]: type("string | null").optional(),
  [OrderEntityFields.driverName]: type("string | null").optional(),
  [OrderEntityFields.driverEmail]: type("string | null").optional(),
  [OrderEntityFields.driverPhone]: type("string | null").optional(),
  [OrderEntityFields.createdAt]: type("string | null").optional(),
  [OrderEntityFields.updatedAt]: type("string | null").optional(),
  [OrderEntityFields.paymentRef]: "string",
});
export type OrderEntity = typeof orderEntity.infer;

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
  [PaymentEntityFields.date]: "string | null",
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
  createdAt: "string | null",
  notes: "string | null",
});
export type WaitlistEntity = typeof waitlistEntity.infer;
