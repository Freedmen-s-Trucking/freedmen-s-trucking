import 'source-map-support/register.js';
import 'dotenv/config';
import './config.js';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { CollectionName, DriverEntity, LATEST_PLATFORM_OVERVIEW_PATH, PlatformOverviewEntity } from './types/index.js';
import { DocumentReference, FieldValue, getFirestore } from 'firebase-admin/firestore';

export { httpServer } from './http-server.js';

export const driverUpdateTrigger = onDocumentWritten(`${CollectionName.DRIVERS}/{driverId}`, ({ data, params }) => {
  const before = data?.before?.data?.() as DriverEntity | undefined;
  const after = data?.after?.data?.() as DriverEntity | undefined;
  const bVstatus = before?.verificationStatus;
  const aVstatus = after?.verificationStatus;
  console.log(`Driver updated:`, bVstatus, aVstatus);
  if (aVstatus != bVstatus) {
    const update = {} as Record<keyof PlatformOverviewEntity, FieldValue>;
    switch (aVstatus) {
      case 'pending':
        update.totalPendingVerificationDrivers = FieldValue.increment(1);
        break;
      case 'failed':
        update.totalFailedVerificationDrivers = FieldValue.increment(1);
        break;
      case 'verified':
        update.totalVerifiedDrivers = FieldValue.increment(1);
        break;
    }
    switch (bVstatus) {
      case 'pending':
        update.totalPendingVerificationDrivers = FieldValue.increment(-1);
        break;
      case 'failed':
        update.totalFailedVerificationDrivers = FieldValue.increment(-1);
        break;
      case 'verified':
        update.totalVerifiedDrivers = FieldValue.increment(-1);
        break;
    }

    const firestore = getFirestore();
    (firestore.doc(LATEST_PLATFORM_OVERVIEW_PATH) as DocumentReference<PlatformOverviewEntity>).set(update, {
      merge: true,
    });
  }
});
