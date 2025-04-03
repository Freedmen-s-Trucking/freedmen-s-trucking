import { onRequest } from 'firebase-functions/v2/https';
import { Hono } from 'hono';
import { getRequestListener } from '@hono/node-server';
import { calculateTheCheapestCombinationOfVehicles } from './utils/compute-delivery-estimationy.js';
import { GeoRoutingService, GeoRoutingServiceType, GetDistanceInKilometerResponse } from './geocoding/georouting.js';
import { convertKilometerToMiles } from './utils/convert.js';
import {
  apiReqScheduleDeliveryIntent,
  CollectionName,
  ComputeDeliveryEstimation,
  DriverOrderStatus,
  LATEST_PLATFORM_OVERVIEW_PATH,
  newOrderEntity,
  PaymentActorType,
  PaymentEntity,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  PlatformOverviewEntity,
  type,
  UserEntity,
  VerificationStatus,
  DriverEntity,
  OrderEntity,
  OrderStatus,
} from '@freedmen-s-trucking/types';
import _stripe from 'stripe';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { CollectionReference, DocumentReference, FieldValue, getFirestore } from 'firebase-admin/firestore';
console.log({
  api: process.env.STRIPE_SECRET_KEY,
  webhook: process.env.STRIPE_WEBHOOK_SECRET,
});
const stripe = new _stripe(process.env.STRIPE_SECRET_KEY!);

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

const apiV1Route = new Hono();
apiV1Route.use(logger(customLogger));
apiV1Route.use(secureHeaders());

apiV1Route.use('*', async (c, next) => {
  await next();
});

apiV1Route.post('/compute-delivery-estimation', async (c) => {
  const data: ComputeDeliveryEstimation = await c.req.json();
  const computeDistanceWithOSM = GeoRoutingService.create(GeoRoutingServiceType.osm);
  const computeDistanceWithHaversine = GeoRoutingService.create(GeoRoutingServiceType.haversine);

  let distanceInKm: GetDistanceInKilometerResponse | undefined;
  const fallback = async () => {
    try {
      distanceInKm = await computeDistanceWithHaversine.getDistanceInKilometer({
        startPoint: data.pickupLocation,
        endPoint: data.deliveryLocation,
      });
    } catch (e2) {
      console.error('>>failed to compute distance with Haversine', (e2 as Error).stack, data);
      throw e2;
    }
  };
  try {
    distanceInKm = await computeDistanceWithOSM.getDistanceInKilometer({
      startPoint: data.pickupLocation,
      endPoint: data.deliveryLocation,
    });
    if (!distanceInKm) {
      await fallback();
    }
  } catch (e) {
    console.error('failed to compute distance with OSM fallback to Haversine', (e as Error).stack, data);
    await fallback();
  }
  const distanceInMiles = convertKilometerToMiles(distanceInKm?.distance || 0);
  console.log({ distanceInKm, distanceInMiles, ...data });
  const response = calculateTheCheapestCombinationOfVehicles(data.products, distanceInMiles, data.priority);
  return c.json({
    ...response,
    distanceInMiles,
    durationInSeconds: distanceInKm?.durationInMin ? distanceInKm.durationInMin * 60 : undefined,
  });
});

apiV1Route.post('/stripe/create-payment-intent', async (c) => {
  const reqData = apiReqScheduleDeliveryIntent(await c.req.json());
  if (reqData instanceof type.errors) {
    return c.json({ error: reqData.summary }, 400);
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.ceil(reqData.metadata.priceInUSD * 100),
    currency: 'usd',
    metadata: Object.entries(reqData.metadata).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: typeof value === 'number' ? value : JSON.stringify(value) }),
      {},
    ),
  });
  return c.json({ clientSecret: paymentIntent.client_secret });
});

apiV1Route.post('/stripe/webhook', async (c) => {
  let event: _stripe.Event;
  // try {
  //   const sig = c.req.header('stripe-signature');
  //   const arrayBuffer = await c.req.arrayBuffer(); // Get body as ArrayBuffer
  //   const buffer = Buffer.from(arrayBuffer); // Convert to Buffer

  //   event = stripe.webhooks.constructEvent(buffer, sig || '', process.env.STRIPE_WEBHOOK_SECRET!);
  // }
  // catch (err) {
  //   return c.json({error: `Webhook Error: ${(err as Error).message}`}, 400);
  // }

  event ??= await c.req.json();
  console.log(event.type);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const serializedOrder = paymentIntent.metadata;
      if (!serializedOrder) {
        console.error('Invalid request: missing serializedOrder');
        return c.json({ error: 'Invalid request: missing serializedOrder' }, 400);
      }

      const newOrder = Object.entries(paymentIntent.metadata).reduce(
        (acc, [key, value]) => {
          acc[key] = typeof value === 'number' ? value : JSON.parse(value);
          return acc;
        },
        {} as Record<string, unknown>,
      );
      const verifiedNewOrder = newOrderEntity(newOrder);
      if (verifiedNewOrder instanceof type.errors) {
        return c.json({ error: verifiedNewOrder.summary }, 400);
      }

      const firestore = getFirestore();

      const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
        DriverEntity,
        DriverEntity
      >;
      const query = driverCollection
        .where('verificationStatus', '==', 'verified' as VerificationStatus)
        .orderBy('activeTasks', 'asc');
      const snapshot = await query.limit(1).get();
      const driverId = snapshot.empty ? null : snapshot.docs[0].id;
      const userCollection = firestore.collection('users') as CollectionReference<UserEntity, UserEntity>;
      const user = await userCollection.doc(verifiedNewOrder.ownerId).get();

      // Save the payment.
      const paymentCollection = firestore.collection(CollectionName.PAYMENTS) as CollectionReference<
        PaymentEntity,
        PaymentEntity
      >;
      const paymentDocRef = await paymentCollection.add({
        type: PaymentType.INCOME,
        status: PaymentStatus.COMPLETED,
        amountInUSD: paymentIntent.amount / 100,
        provider: {
          name: PaymentProvider.STRIPE,
          ref: paymentIntent.id,
        },
        to: {
          id: 'system',
          name: "Freedmen's Trucking",
          type: PaymentActorType.PLATFORM,
        },
        fee: 0,
        receivedAmount: paymentIntent.amount / 100,
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
          totalEarnings: FieldValue.increment(paymentIntent.amount / 100),
          ...(driverId ? {} : { totalUnassignedOrders: FieldValue.increment(1) }),
        },
        { merge: true },
      );
      console.log({ paymentIntent, meta: paymentIntent.metadata });
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log({ paymentMethod });
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  return c.json({ received: true });
});

apiV1Route.notFound((c) => {
  return c.text('404 Not Found', 404);
});

apiV1Route.onError((err, c) => {
  console.error(`${err}`, err);
  return c.text('Internal Server Error', 500);
});

const app = new Hono();
app.route('/api/v1', apiV1Route);

export const httpServer = onRequest(
  {
    timeoutSeconds: 60,
  },
  getRequestListener(app.fetch),
);
// Export with proper initialization
// export const api = onRequest(
//   {
//     memory: "1GiB",
//     timeoutSeconds: 60,
//     concurrency: 100,
//   },
//   (req, res) => {
//     // Initialize stripe here if you prefer
//     return getRequestListener(app.fetch)(req, res);
//   }
// );
