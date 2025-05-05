import {onSchedule} from "firebase-functions/v2/scheduler";
import {CollectionReference, getFirestore, QueryDocumentSnapshot} from "firebase-admin/firestore";
import {CollectionName, DriverEntity, extractedDriverLicenseDetails, type} from "@freedmen-s-trucking/types";
import {ImageAnnotatorClient} from "@google-cloud/vision";
import {extractDriverLicenseDetailsFromText} from "~src/services/ai-agent/extract-driver-license-details";

const isFunctionEmulator = process.env.FUNCTIONS_EMULATOR === "true";

/**
 * Extracts text from an image using Google Cloud Vision API.
 * @param path - The path to the image file in Google Cloud Storage.
 * @returns The extracted text from the image or null if extraction fails.
 */
const extractTextFromImage = async (path: string) => {
  if (isFunctionEmulator) {
    return `8:12
Temporary Washington DC
Proof of Insurance Card
ALLSTATE INDEMNITY COMPANY
KWASI SINNETTE
2920 VISTA ST NE
WASHINGTON, DC,
20018
NAIC# 19240
Temporary POLICY NUMBER:
818654778
EFFECTIVE DATE:
09/27/24
EXPIRATION DATE:
YEAR/MAKE/MODEL:
2016/KIA/SOUL
VEHICLE ID NUMBER:
KNDJP3A54G7243579
11/26/24
:
•
Allstate®
You're in good hands.`;
  }
  try {
    const client = new ImageAnnotatorClient();

    const [result] = await client.textDetection(`gs://${path}`);
    const text = result.fullTextAnnotation?.text;

    return text;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Runs every 5mins to check for drivers with pending insurance verification and verify them using authenticate API.
 */
export const scheduleDriverInsuranceVerification = onSchedule("*/5 * * * *", async () => {
  const firestore = getFirestore();
  const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  const driverInsurancePending = await driverCollection
    .where("driverInsuranceVerificationStatus" satisfies keyof DriverEntity, "==", "pending")
    .get();

  const driverWithoutInsurance = await driverCollection
    .where("driverInsuranceStoragePath" satisfies keyof DriverEntity, "==", null)
    .get();

  // Using a Set for better performance with large result sets
  const uniqueDocs: QueryDocumentSnapshot<DriverEntity>[] = [];
  const seenIds = new Set();

  for (const doc of [...driverInsurancePending.docs, ...driverWithoutInsurance.docs]) {
    if (!seenIds.has(doc.id)) {
      seenIds.add(doc.id);
      uniqueDocs.push(doc);
    }
  }

  const tasks: Promise<void>[] = [];
  for (const driverSnapshot of uniqueDocs) {
    tasks.push(verifyDriverInsurance(driverSnapshot, driverCollection));
  }
  await Promise.all(tasks);
});

/**
 * Verifies driver's insurance by checking if the driver has verified their license and has uploaded an insurance image.
 * If the driver has not verified their license, the function will return without doing anything.
 * If the driver has not uploaded an insurance image, the function will update the driver's insurance verification status to "failed".
 * If the driver has uploaded an insurance image, the function will extract the relevant text from the image and check if the driver's name is present in the text.
 * If the driver's name is not present in the text, the function will update the driver's insurance verification status to "failed".
 * If the driver's name is present in the text, the function will extract the relevant text from the image and check if the driver's license details are present in the text.
 * If the driver's license details are present in the text, the function will update the driver's insurance verification status to "verified".
 */
const verifyDriverInsurance = async (
  driverSnapshot: QueryDocumentSnapshot<DriverEntity>,
  driverCollection: CollectionReference<DriverEntity, DriverEntity>,
) => {
  const driver = driverSnapshot.data();

  if (driver.driverLicenseVerificationStatus !== "verified") {
    return; // Driver has not verified their license: Skipping
  }

  if (!driver.driverInsuranceStoragePath) {
    await driverCollection.doc(driverSnapshot.id).update({
      driverInsuranceVerificationIssues: ["No insurance uploaded. Please upload your insurance card."],
      driverInsuranceVerificationStatus: "failed",
    });
    return; // Driver has no insurance storage path: Skipping
  }

  try {
    const extractedDriverInsuranceText = await extractTextFromImage(driver.driverInsuranceStoragePath);
    if (!extractedDriverInsuranceText) {
      console.warn("Failed to call extractTextFromImage", {driverId: driverSnapshot.id});
      await driverCollection.doc(driverSnapshot.id).update({
        driverInsuranceVerificationIssues: [
          "Failed to extract any text from the insurance uploaded. Please upload a clear image of your insurance card.",
        ],
        driverInsuranceVerificationStatus: "failed",
      });
      return;
    }

    const extractedDriverInsuranceTextLC = extractedDriverInsuranceText.toLowerCase();
    const driverNames = `${driver.firstName} ${driver.lastName}`.split(" ");
    const missingNames = driverNames.filter((name) => !extractedDriverInsuranceTextLC.includes(name.toLowerCase()));
    if (missingNames.length > 0) {
      console.warn("Driver name not found in insurance text", {driverId: driverSnapshot.id, missingNames});
      // TODO:: send email
      await driverCollection.doc(driverSnapshot.id).update({
        driverInsuranceVerificationIssues: [
          "Driver name not found in insurance text. Please upload a clear image of your insurance card.",
          `Missing Names: [${missingNames.join(", ")}]`,
        ],
        driverInsuranceVerificationStatus: "failed",
      });
      return;
    }

    const rawExtractedDriverLicenseDetails = await extractDriverLicenseDetailsFromText(extractedDriverInsuranceText);
    if (!rawExtractedDriverLicenseDetails) {
      console.warn("Failed extract relevant text from driver license row with OpenAI", {
        driverId: driverSnapshot.id,
      });
      // TODO:: send email
      await driverCollection.doc(driverSnapshot.id).update({
        driverInsuranceVerificationIssues: [
          "Failed to extract driver license details. Please upload a clear image of your insurance card.",
        ],
        driverInsuranceVerificationStatus: "failed",
      });
      return;
    }

    const driverLicenseDetails = extractedDriverLicenseDetails(JSON.parse(rawExtractedDriverLicenseDetails));
    if (driverLicenseDetails instanceof type.errors) {
      console.warn("Failed to extract driver license details", {driverId: driverSnapshot.id});
      // TODO:: send email
      await driverCollection.doc(driverSnapshot.id).update({
        driverInsuranceVerificationIssues: driverLicenseDetails.map((error) => error.message),
        driverInsuranceVerificationStatus: "failed",
      });
      return;
    }

    const expirationDate = new Date(driverLicenseDetails.policy_expiration_date);
    if (expirationDate < new Date()) {
      console.warn("Driver's insurance has expired", {driverId: driverSnapshot.id});
      await driverCollection.doc(driverSnapshot.id).update({
        driverInsuranceVerificationIssues: ["Insurance has expired"],
        driverInsuranceVerificationStatus: "failed",
      });
      return;
    }

    await driverCollection.doc(driverSnapshot.id).update({
      driverInsuranceVerificationStatus: "verified",
      driverInsuranceVerificationIssues: [],
    });
  } catch (error) {
    console.error("Failed to verify driver insurance", error);
  }
};
