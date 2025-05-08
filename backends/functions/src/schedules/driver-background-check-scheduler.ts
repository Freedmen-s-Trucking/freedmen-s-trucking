import {onSchedule} from "firebase-functions/v2/scheduler";
import {CollectionReference, getFirestore} from "firebase-admin/firestore";
import {CollectionName, DriverEntity} from "@freedmen-s-trucking/types";
import {sevenYearCriminalReport} from "~src/http-server/authenticate/service";

/**
 * Runs every 5mins to check for drivers with pending background checks
 */
export const scheduleBackgroundCheck = onSchedule("*/5 * * * *", async () => {
  console.log("Running scheduler for background check");
  const firestore = getFirestore();
  const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  const snapshot = await driverCollection
    .where("driverLicenseVerificationStatus" satisfies keyof DriverEntity, "==", "verified")
    .get();
  if (snapshot.empty) {
    return;
  }

  for (const driverSnapshot of snapshot.docs) {
    const driver = driverSnapshot.data();
    if (!driver.authenticateAccessCode) {
      console.warn("Driver has no authentication access code", {driverId: driverSnapshot.id});
      continue;
    }
    if (driver.driverLicenseVerificationStatus !== "verified") {
      // Verify the driver license before running background check.
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
