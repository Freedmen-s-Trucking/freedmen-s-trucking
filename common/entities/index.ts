export type UserRole = "ADMIN" | "DRIVER" | "CUSTOMER";

export interface Certificate {
  storagePath: string;
  status: "pending" | "verified" | "failed";
  expiry: string | null;
  issues: string[];
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
  isEmailVerified: boolean;
  isPhoneNumberVerified: boolean;
  authMethods: AuthMethod[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CustomerEntity {}

export interface DriverEntity {
  insurance: Certificate;
  driverLicense: Certificate;
  withdrawalHistory: [];
  paymentMethod: [];
  verificationStatus: "pending" | "verified" | "failed";
  currentEarnings: number;
  totalEarnings: number;
  tasksCompleted: number;
  activeTasks: number;
  verificationInfo?: {
    expiry: string | null;
  };
}

export interface ProductEntity {
  name: string;
  dimensions: { width: number; height: number; length: number };
  weight: number;
  quantity: number;
}

export interface RequiredVehicleEntity {
  type: "SEDAN" | "SUV" | "VAN" | "TRUCK" | "FREIGHT";
  quantity: number;
}

export interface OrderEntity {
  id: string;
  clientName: string;
  pickupLocation: string;
  targetLocation: string;
  requiredVehicles: RequiredVehicleEntity[];
  price: number;
  products: ProductEntity[];
  status:
    | "pending-payment"
    | "payment-received"
    | "assigned-to-driver"
    | "driver-on-the-way"
    | "picked-up"
    | "delivered";
  driverStatus:
    | "pending"
    | "accepted"
    | "on the way"
    | "picked up"
    | "delivered";
  updated: boolean;
  createdAt: string;
  updatedAt: string;
}
