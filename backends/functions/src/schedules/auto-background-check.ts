import {onSchedule} from "firebase-functions/v2/scheduler";
import {CollectionReference, getFirestore} from "firebase-admin/firestore";
import {CollectionName, DriverEntity} from "@freedmen-s-trucking/types";
import {sevenYearCriminalReport, verifyIdentity} from "~src/http-server/authenticate/service";
import {isResponseError} from "up-fetch";

/**
 * Runs every 5mins to check for drivers with pending background checks
 */
export const scheduleBackgroundCheck = onSchedule("*/5 * * * *", async () => {
  const firestore = getFirestore();
  const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  const snapshot = await driverCollection.where("driverLicenseVerificationStatus", "==", "verified").get();
  if (snapshot.empty) {
    return;
  }

  for (const driverSnapshot of snapshot.docs) {
    const driver = driverSnapshot.data();
    if (!driver.authenticateAccessCode) {
      console.warn("Driver has no authentication access code", {driverId: driverSnapshot.id});
      continue;
    }
    if (["clear", "recordFound"].includes(driver.sevenYearBackgroundCheck || "")) {
      continue;
    }

    try {
      const res = await sevenYearCriminalReport(driver.authenticateAccessCode);
      await firestore
        .collection(CollectionName.DRIVERS)
        .doc(driverSnapshot.id)
        .update({
          sevenYearBackgroundCheck:
            res.result.Candidates.Message === "No Criminal Records Found" ? "clear" : "recordFound",
        });
    } catch (error) {
      console.error(error);
    }
  }
});

/**
 * Runs every 5mins to check for drivers with pending identity verification and verify them using authenticate API.
 */
export const scheduleDriverIdentityVerification = onSchedule("*/5 * * * *", async () => {
  const firestore = getFirestore();
  const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  const snapshot = await driverCollection.where("driverLicenseVerificationStatus", "==", "pending").get();
  if (snapshot.empty) {
    return;
  }

  for (const driverSnapshot of snapshot.docs) {
    const driver = driverSnapshot.data();
    if (!driver.authenticateAccessCode) {
      console.warn("Driver has no authentication access code", {driverId: driverSnapshot.id});
      continue;
    }

    try {
      const res = await verifyIdentity(driver.authenticateAccessCode).catch((error) => {
        if (isResponseError(error)) {
          if (error.data.errorCode === "IDENTITY_ALREADY_VERIFIED") {
            return {success: true};
          }
          return {success: false};
        } else {
          console.error("Failed to verify driver identity", {driverId: driverSnapshot.id, error});
          return null;
        }
      });

      if (res !== null) {
        await firestore
          .collection(CollectionName.DRIVERS)
          .doc(driverSnapshot.id)
          .update({
            driverLicenseVerificationStatus: res.success ? "verified" : "failed",
          });
      }
    } catch (error) {
      console.error(error);
    }
  }
});
