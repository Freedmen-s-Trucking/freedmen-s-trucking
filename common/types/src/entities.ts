import {
  authMethodType,
  certificateType,
  locationType,
  paymentMethodType,
  productWithQuantityType,
  type,
  vehicleType,
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
  email: "string | null",
  phoneNumber: "string | null",
  photoURL: "string | null",
  uploadedProfileStoragePath: "string | null",
  isEmailVerified: "boolean",
  isPhoneNumberVerified: "boolean",
  authMethods: authMethodType.array(),
  createdAt: "string | null",
  updatedAt: "string | null",
});
export type UserEntity = typeof userEntity.infer;

export const driverEntity = type({
  driverInsurance: certificateType,
  driverLicense: certificateType,
  withdrawalHistory: withdrawalEntity.array(),
  paymentMethods: paymentMethodType.array(),
  verificationStatus: "'pending' | 'verified' | 'failed'",
  currentEarnings: "number | null",
  totalEarnings: "number | null",
  tasksCompleted: "number | null",
  activeTasks: "number | null",
});
export type DriverEntity = typeof driverEntity.infer;

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
  createdAt: "string",
  updatedAt: "string",
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
  ON_THE_WAY = "on-the-way",
  PICKED_UP = "picked-up",
  DELIVERED = "delivered",
}

export enum OrderPriority {
  STANDARD = "standard",
  EXPEDITED = "expedited",
  URGENT = "urgent",
}

export enum OrderEntityFields {
  clientName = "clientName",
  clientId = "clientId",
  pickupLocation = "pickupLocation",
  deliveryLocation = "deliveryLocation",
  requiredVehicles = "requiredVehicles",
  price = "price",
  products = "products",
  priority = "priority",
  status = "status",
  driverStatus = "driverStatus",
  driverId = "driverId",
  createdAt = "createdAt",
  updatedAt = "updatedAt",
  payment = "payment",
}

export const orderEntity = type({
  [OrderEntityFields.clientName]: "string",
  [OrderEntityFields.clientId]: "string",
  [OrderEntityFields.pickupLocation]: locationType,
  [OrderEntityFields.deliveryLocation]: locationType,
  [OrderEntityFields.requiredVehicles]: requiredVehicleEntity.array(),
  [OrderEntityFields.price]: "number",
  [OrderEntityFields.products]: productWithQuantityType.array(),
  [OrderEntityFields.priority]: type.valueOf(OrderPriority),
  [OrderEntityFields.status]: type.valueOf(OrderStatus),
  [OrderEntityFields.driverStatus]: type.valueOf(DriverOrderStatus),
  [OrderEntityFields.driverId]: type("string | null").optional(),
  [OrderEntityFields.createdAt]: type("string | null").optional(),
  [OrderEntityFields.updatedAt]: type("string | null").optional(),
  [OrderEntityFields.payment]: type({
    paymentIntentId: "string",
    "[string]": "unknown",
  }).optional(),
});
export type OrderEntity = typeof orderEntity.infer;

export const ORDER_EXAMPLES: (OrderEntity & { id: string })[] = [
  {
    id: "ORD-2023-001",
    clientName: "John Smith",
    clientId: "CLIENT-2023-001",
    priority: OrderPriority.STANDARD,
    pickupLocation: {
      address: "123 Main St, Anytown",
      latitude: 40.7128,
      longitude: -74.006,
    },
    deliveryLocation: {
      address: "456 Oak Ave, Othertown",
      latitude: 40.7128,
      longitude: -74.006,
    },
    products: [],
    requiredVehicles: [
      {
        type: "SEDAN",
        quantity: 1,
      },
    ],
    price: 35.5,
    status: OrderStatus.ASSIGNED_TO_DRIVER,
    driverStatus: DriverOrderStatus.WAITING,
    driverId: "OjcIM5cPunP2cnYyMlxvEeYDTTo1",
    createdAt: "2025-03-24T10:30:00",
  },
  {
    id: "ORD-2023-002",
    clientName: "Sarah Johnson",
    clientId: "CLIENT-2023-002",
    priority: OrderPriority.STANDARD,
    pickupLocation: {
      address: "789 Pine Rd, Sometown",
      latitude: 40.7128,
      longitude: -74.006,
    },
    deliveryLocation: {
      address: "101 Maple Dr, Newtown",
      latitude: 40.7128,
      longitude: -74.006,
    },
    products: [],
    requiredVehicles: [
      {
        type: "SUV",
        quantity: 1,
      },
    ],
    price: 45.75,
    status: OrderStatus.ASSIGNED_TO_DRIVER,
    driverStatus: DriverOrderStatus.ON_THE_WAY,
    driverId: "OjcIM5cPunP2cnYyMlxvEeYDTTo1",
    createdAt: "2025-03-24T09:15:00",
  },
  {
    id: "ORD-2023-003",
    clientName: "John Doe",
    clientId: "CLIENT-2023-003",
    priority: OrderPriority.STANDARD,
    pickupLocation: {
      address: "789 Pine St, Sometown",
      latitude: 40.7128,
      longitude: -74.006,
    },
    deliveryLocation: {
      address: "101 Maple, Newtown",
      latitude: 40.7128,
      longitude: -74.006,
    },
    products: [],
    requiredVehicles: [
      {
        type: "SUV",
        quantity: 1,
      },
    ],
    price: 35.75,
    status: OrderStatus.ASSIGNED_TO_DRIVER,
    driverStatus: DriverOrderStatus.PICKED_UP,
    driverId: "OjcIM5cPunP2cnYyMlxvEeYDTTo1",
    createdAt: "2025-03-24T09:15:00",
  },
  {
    id: "ORD-2023-004",
    clientName: "John Doe",
    clientId: "CLIENT-2023-004",
    priority: OrderPriority.STANDARD,
    pickupLocation: {
      address: "789 Pine St, Sometown",
      latitude: 40.7128,
      longitude: -74.006,
    },
    deliveryLocation: {
      address: "101 Maple, Newtown",
      latitude: 40.7128,
      longitude: -74.006,
    },
    products: [],
    requiredVehicles: [
      {
        type: "SUV",
        quantity: 1,
      },
    ],
    price: 35.75,
    status: OrderStatus.ASSIGNED_TO_DRIVER,
    driverStatus: DriverOrderStatus.PICKED_UP,
    driverId: "OjcIM5cPunP2cnYyMlxvEeYDTTo1",
    createdAt: "2025-03-24T09:15:00",
  },
];
