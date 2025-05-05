import {onSchedule} from "firebase-functions/v2/scheduler";
import {CollectionReference, getFirestore} from "firebase-admin/firestore";
import {CollectionName, DriverEntity} from "@freedmen-s-trucking/types";
import {verifyIdentity} from "~src/http-server/authenticate/service";
import {isResponseError} from "up-fetch";
import {sendEmail} from "~src/services/mails/sendgrid";
import {ENV_PUBLIC_WEBAPP_URL} from "~src/utils/envs";

/**
 * Runs every 5mins to check for drivers with pending identity verification and verify them using authenticate API.
 */
export const scheduleDriverIdentityVerification = onSchedule("*/5 * * * *", async () => {
  console.log("Running driver identity verification scheduler");
  const firestore = getFirestore();
  const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  const snapshot = await driverCollection
    .where("driverLicenseVerificationStatus" satisfies keyof DriverEntity, "==", "pending")
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

    try {
      const res = await verifyIdentity(driver.authenticateAccessCode)
        .then((res) => {
          return {...res, issues: []};
        })
        .catch((error) => {
          if (isResponseError(error)) {
            if (error.data.errorCode === "IDENTITY_ALREADY_VERIFIED") {
              return {success: true, issues: []};
            }
            return {success: false, issues: [error.data?.errorMessage]};
          } else {
            console.error("Failed to verify driver identity", {driverId: driverSnapshot.id, error});
            return null;
          }
        });

      if (res !== null) {
        const dbTask = firestore
          .collection(CollectionName.DRIVERS)
          .doc(driverSnapshot.id)
          .update({
            driverLicenseVerificationStatus: res.success ? "verified" : "failed",
            driverLicenseVerificationIssues: res.success ? [] : res.issues,
          });
        let mailTask: Promise<unknown> = Promise.resolve();
        if (driver.email) {
          mailTask = sendEmail({
            to: driver.email,
            subject: "Driver License Verification",
            text: `
            Your driver license verification has been ${res.success ? "verified" : "failed"}.
            ${res.success ? "" : `Issues: ${res.issues.join(", ")}`}
            `,
            html: `
            <p>Your driver license verification has been ${res.success ? "verified" : "failed"}.</p>
            ${
              res.success
                ? "<p>This means your driver license has been verified and you can now use the app.</p>"
                : `<p>Go to your account to view the issues. <a href="${ENV_PUBLIC_WEBAPP_URL}">Go to Account</a></p>`
            }
            `,
          }).catch((error) => {
            console.error("Failed to send email", {driverId: driverSnapshot.id, error});
          });
        }
        await Promise.all([dbTask, mailTask]);
      }
    } catch (error) {
      console.error(error);
    }
  }
});
