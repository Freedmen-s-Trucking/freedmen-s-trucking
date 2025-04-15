import { DriverEntity } from "@freedmen-s-trucking/types";
import { QueryDocumentSnapshot, SnapshotOptions } from "@firebase/firestore";

export const driverEntityConverter = {
  toFirestore: (driver: DriverEntity): DriverEntity => {
    const res: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(driver)) {
      if (key && value !== undefined) {
        res[key as keyof DriverEntity] =
          driver[key as keyof DriverEntity] || null;
      }
    }

    return res as DriverEntity;
  },

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
