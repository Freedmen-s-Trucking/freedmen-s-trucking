export type UserRole = "ADMIN" | "DRIVER" | "CUSTOMER";

export interface Certificate {
  storagePath: string;
  status: "pending" | "verified" | "failed";
  expiry: string | null;
  issues: string[];
}

export interface WithdrawalEntity {
  id: string;
  amount: number;
  date: string;
  status: "pending" | "completed" | "failed";
}

export interface PaymentMethod {
  id: string;
  type: "BANK";
  details: string;
  default: boolean;
}

export interface AuthMethod {
  provider: string;
  providerRowData: Record<string, any>;
}

export interface UserEntity {
  uid: string;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  uploadedProfileStoragePath?: string | null;
  isEmailVerified: boolean;
  isPhoneNumberVerified: boolean;
  authMethods: AuthMethod[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CustomerEntity {}

export interface DriverEntity {
  driverInsurance: Certificate;
  driverLicense: Certificate;
  withdrawalHistory: WithdrawalEntity[];
  paymentMethods: PaymentMethod[];
  verificationStatus: "pending" | "verified" | "failed";
  currentEarnings: number;
  totalEarnings: number;
  tasksCompleted: number;
  activeTasks: number;
}

export interface ProductEntity {
  name: string;
  dimensions: {
    widthInInches: number;
    heightInInches: number;
    lengthInInches: number;
  };
  weightInLbs: number;
  quantity: number;
}

export type VehicleType = "SEDAN" | "SUV" | "VAN" | "TRUCK" | "FREIGHT";
export interface RequiredVehicleEntity {
  type: VehicleType;
  quantity: number;
}

export interface NotificationEntity {
  id: string;
  type: "order" | "system";
  message: string;
  read: boolean;
  targetType: "customer" | "driver";
  targetId: string;
  createdAt: string;
  updatedAt: string;
}

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
  id = "id",
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
}
export interface LocationEntity {
  address: string;
  latitude: number;
  longitude: number;
}

export interface OrderEntity {
  [OrderEntityFields.id]: string;
  [OrderEntityFields.clientName]: string;
  [OrderEntityFields.clientId]: string;
  [OrderEntityFields.pickupLocation]: LocationEntity;
  [OrderEntityFields.deliveryLocation]: LocationEntity;
  [OrderEntityFields.requiredVehicles]: RequiredVehicleEntity[];
  [OrderEntityFields.price]: number;
  [OrderEntityFields.products]: ProductEntity[];
  [OrderEntityFields.priority]: OrderPriority;
  [OrderEntityFields.status]: OrderStatus;
  [OrderEntityFields.driverStatus]: DriverOrderStatus;
  [OrderEntityFields.driverId]?: string | null;
  [OrderEntityFields.createdAt]: string;
  [OrderEntityFields.updatedAt]?: string;
  payment?: {
    paymentIntentId: string;
    [key:string]: string;
  };
}

export const ORDER_EXAMPLES: OrderEntity[] = [
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
