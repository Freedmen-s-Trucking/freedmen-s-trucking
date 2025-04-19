import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import {
  CollectionName,
  DriverEntity,
  LATEST_PLATFORM_OVERVIEW_PATH,
  PlatformOverviewEntity,
} from '@freedmen-s-trucking/types';
import { DocumentReference, FieldValue, getFirestore } from 'firebase-admin/firestore';

const updatePlatformOverviewOnDriverVerificationStatusChange = async (
  before: DriverEntity | undefined,
  after: DriverEntity | undefined,
) => {
  const bVStatus = before?.verificationStatus;
  const aVStatus = after?.verificationStatus;
  if (aVStatus !== bVStatus) {
    const update = {} as Record<keyof PlatformOverviewEntity, FieldValue>;
    switch (aVStatus) {
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
    switch (bVStatus) {
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

    if (Object.keys(update).length > 0) {
      update.updatedAt = FieldValue.serverTimestamp();
      const firestore = getFirestore();
      await (firestore.doc(LATEST_PLATFORM_OVERVIEW_PATH) as DocumentReference<PlatformOverviewEntity>).set(update, {
        merge: true,
      });
    }
  }
};

export const driverUpdateTrigger = onDocumentWritten(
  `${CollectionName.DRIVERS}/{driverId}`,
  async ({ data, params }) => {
    const before = data?.before?.data?.() as DriverEntity | undefined;
    const after = data?.after?.data?.() as DriverEntity | undefined;
    const waterFall = [updatePlatformOverviewOnDriverVerificationStatusChange(before, after)];

    return Promise.all(waterFall);
  },
);
