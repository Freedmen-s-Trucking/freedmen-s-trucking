import { DriverEntity } from "@freedmen-s-trucking/types";
import { QueryDocumentSnapshot, SnapshotOptions } from "@firebase/firestore";

export const driverEntityConverter = {
  toFirestore: (driver: DriverEntity): DriverEntity => ({
    activeTasks: driver.activeTasks || null,
    driverInsuranceVerificationStatus: driver.driverInsuranceVerificationStatus,
    driverInsuranceStoragePath: driver.driverInsuranceStoragePath || null,
    driverInsuranceVerificationIssues:
      driver.driverInsuranceVerificationIssues || null,
    driverLicenseFrontStoragePath: driver.driverLicenseFrontStoragePath || null,
    driverLicenseBackStoragePath: driver.driverLicenseBackStoragePath || null,
    driverLicenseVerificationStatus:
      driver.driverLicenseVerificationStatus || null,
    driverLicenseVerificationIssues:
      driver.driverLicenseVerificationIssues || null,
    location: driver.location || null,
    vehicles: driver.vehicles || [],
    withdrawalHistory: driver.withdrawalHistory || null,
    payoutMethods: driver.payoutMethods || null,
    verificationStatus: driver.verificationStatus || null,
    payoutCapabilities: driver.payoutCapabilities || null,
    verificationMessage: driver.verificationMessage || null,
    stripeConnectAccountId: driver.stripeConnectAccountId || null,
    authenticateAccessCode: driver.authenticateAccessCode,
    currentEarnings: driver.currentEarnings || null,
    totalEarnings: driver.totalEarnings || null,
    tasksCompleted: driver.tasksCompleted || null,
  }),

  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DriverEntity>,
    options: SnapshotOptions,
  ) => {
    const driver = snapshot.data(options);
    return <DriverEntity>{
      activeTasks: driver.activeTasks || null,
      driverInsuranceVerificationStatus:
        driver.driverInsuranceVerificationStatus,
      driverInsuranceStoragePath: driver.driverInsuranceStoragePath || null,
      driverInsuranceVerificationIssues:
        driver.driverInsuranceVerificationIssues || [],
      driverLicenseFrontStoragePath:
        driver.driverLicenseFrontStoragePath || null,
      driverLicenseBackStoragePath: driver.driverLicenseBackStoragePath || null,
      driverLicenseVerificationStatus:
        driver.driverLicenseVerificationStatus || null,
      driverLicenseVerificationIssues:
        driver.driverLicenseVerificationIssues || null,
      location: driver.location || null,
      vehicles: driver.vehicles || [],
      withdrawalHistory: driver.withdrawalHistory || [],
      payoutMethods: driver.payoutMethods || [],
      verificationStatus: driver.verificationStatus,
      payoutCapabilities: driver.payoutCapabilities || null,
      verificationMessage: driver.verificationMessage || null,
      stripeConnectAccountId: driver.stripeConnectAccountId || null,
      authenticateAccessCode: driver.authenticateAccessCode,
      currentEarnings: driver.currentEarnings || null,
      totalEarnings: driver.totalEarnings || null,
      tasksCompleted: driver.tasksCompleted || null,
    };
  },
};
