import {
  apiResSetupConnectedAccount,
  CollectionName,
  DriverEntity,
  DriverOrderStatus,
  LATEST_PLATFORM_OVERVIEW_PATH,
  newOrderEntity,
  OrderEntity,
  OrderStatus,
  PaymentActorType,
  PaymentEntity,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  PlatformOverviewEntity,
  type,
  UserEntity,
  VerificationStatus,
} from '@freedmen-s-trucking/types';
import { CollectionReference, DocumentReference, FieldValue, getFirestore } from 'firebase-admin/firestore';
import { handleStripeWebhookEvent } from './webhook.js';
import { Hono } from 'hono';
import { createPaymentIntent, generateConnectedAccountSetupLink } from './payment';

const router = new Hono();

router.post('/create-payment-intent', async (c) => {
  const response = await createPaymentIntent(await c.req.json());
  if (response instanceof Error) {
    return c.json({ error: response.message }, 400);
  }
  return c.json({ clientSecret: response.client_secret });
});

router.post('/setup-connected-account', async (c) => {
  const driver = apiResSetupConnectedAccount(await c.req.json());
  if (driver instanceof type.errors) {
    return c.json({ error: driver.summary }, 400);
  }
  const response = await generateConnectedAccountSetupLink(driver);
  if (response instanceof Error) {
    return c.json({ error: response.message }, 400);
  }
  return c.json({ response });
});

router.post('/webhook', async (c) => {
  const res = await handleStripeWebhookEvent({
    getHeader: (name) => c.req.header(name),
    getRawBody: () => c.req.arrayBuffer(),
    onAccountUpdated: async (account) => {
      const firestore = getFirestore();

      const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
        DriverEntity,
        DriverEntity
      >;
      const driverSnapshot = await driverCollection
        .where('stripeConnectAccountId' satisfies keyof DriverEntity, '==', account.id)
        .limit(1)
        .get();
      if (driverSnapshot.empty) {
        return new Error('Driver not found');
      }
      const driver = driverSnapshot.docs[0];
      await driverCollection.doc(driver.id).set(
        {
          payoutMethods: account.external_accounts?.data.map((pm) => ({
            id: pm.id,
            type: pm.object,
            status: pm.status,
            name: pm.object === 'bank_account' ? pm.bank_name : pm.brand,
          })),
          payoutCapabilities: { transfers: account.capabilities?.transfers || 'inactive' },
        },
        { merge: true },
      );
      return null;
    },
    onPaymentIntentSucceeded: async ({ id, amount }, newOrder) => {
      if (!newOrder) {
        console.error('Invalid request: missing serializedOrder');
        return new Error('Invalid request: missing serializedOrder');
      }

      const verifiedNewOrder = newOrderEntity(newOrder);
      if (verifiedNewOrder instanceof type.errors) {
        return new Error(verifiedNewOrder.summary);
      }

      const firestore = getFirestore();

      const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
        DriverEntity,
        DriverEntity
      >;
      const query = driverCollection
        .where('verificationStatus' satisfies keyof DriverEntity, '==', 'verified' as VerificationStatus)
        .orderBy('activeTasks', 'asc');
      const snapshot = await query.limit(1).get();
      const driverId = snapshot.empty ? null : snapshot.docs[0].id;
      const userCollection = firestore.collection('users') as CollectionReference<UserEntity, UserEntity>;
      const user = await userCollection.doc(verifiedNewOrder.ownerId).get();
      const driverUserInfo = driverId ? await userCollection.doc(driverId).get() : null;

      // Save the payment.
      const paymentCollection = firestore.collection(CollectionName.PAYMENTS) as CollectionReference<
        PaymentEntity,
        PaymentEntity
      >;
      const paymentDocRef = await paymentCollection.add({
        type: PaymentType.INCOME,
        status: PaymentStatus.COMPLETED,
        amountInUSD: amount / 100,
        provider: {
          name: PaymentProvider.STRIPE,
          ref: id,
        },
        to: {
          id: 'system',
          name: "Freedmen's Trucking",
          type: PaymentActorType.PLATFORM,
        },
        fee: 0,
        receivedAmount: amount / 100,
        from: {
          id: user.id,
          name: user.data()?.displayName || '',
          type: PaymentActorType.CUSTOMER,
        },
        date: new Date().toISOString(),
      });

      // Save the order.
      const orderCollection = firestore.collection(CollectionName.ORDERS) as CollectionReference<
        OrderEntity,
        OrderEntity
      >;
      const order: OrderEntity = {
        ...verifiedNewOrder,
        clientName: user.data()?.displayName || '',
        clientEmail: user.data()?.email || '',
        clientPhone: user.data()?.phoneNumber || '',
        driverStatus: DriverOrderStatus.WAITING,
        status: driverId ? OrderStatus.ASSIGNED_TO_DRIVER : OrderStatus.PAYMENT_RECEIVED,
        driverId,
        driverName: driverUserInfo?.data()?.displayName || '',
        driverEmail: driverUserInfo?.data()?.email || '',
        driverPhone: driverUserInfo?.data()?.phoneNumber || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentRef: paymentDocRef.path,
      };
      await orderCollection.add(order);

      // Update driver's active tasks.
      if (driverId) {
        await driverCollection.doc(driverId).set(
          {
            activeTasks: FieldValue.increment(1),
          },
          { merge: true },
        );
      }

      // Update System summary.
      await (firestore.doc(LATEST_PLATFORM_OVERVIEW_PATH) as DocumentReference<PlatformOverviewEntity>).set(
        {
          totalActiveOrders: FieldValue.increment(1),
          totalEarnings: FieldValue.increment(amount / 100),
          updatedAt: FieldValue.serverTimestamp(),
          ...(driverId ? {} : { totalUnassignedOrders: FieldValue.increment(1) }),
        },
        { merge: true },
      );
      console.log({ paymentIntent: { id, amount }, meta: newOrder });
      return null;
    },
  });

  if (res instanceof Error) {
    console.error(res);
    return c.json({ error: res.message }, 400);
  }
  return c.json({ received: true });
});

export default router;
