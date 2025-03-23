export type UserRole = "ADMIN" | "DRIVER" | "CUSTOMER";
export type CertificateType = "LICENSE" | "DRIVER";

export interface Certificate {
  id: string;
  value: string;
  type: CertificateType;
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
  isAnonymous: boolean;
  authMethods: AuthMethod[];
  customerId: string | null;
  driverId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CustomerEntity {
  userId: string;
}

export interface DriverEntity {
  userId: string;
  uploadedCertificates: Certificate[];
}
