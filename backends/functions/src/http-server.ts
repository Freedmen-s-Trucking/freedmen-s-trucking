import { onRequest } from 'firebase-functions/v2/https';
import { Hono } from 'hono';
import { getRequestListener } from '@hono/node-server';
import { calculateTheCheapestCombinationOfVehicles } from './utils/compute-delivery-estimationy.js';
import { GeoRoutingService, GeoRoutingServiceType, GetDistanceInKilometerResponse } from './geocoding/georouting.js';
import { convertKilometerToMiles } from './utils/convert.js';
import { ComputeDeliveryEstimation, VerificationStatus } from '@freedman-trucking/types';
import _stripe from 'stripe';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { CollectionReference, FieldValue, getFirestore } from 'firebase-admin/firestore';
import { DriverEntity, OrderEntity, OrderStatus } from '@freedman-trucking/types';
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
  const json = await c.req.json();
  console.log({ reqdata: json });
  const { amount: amountInUSD, orderId } = json;
  if (!amountInUSD || !orderId) {
    return c.json({ error: 'Invalid request: missing amount or orderId' }, 400);
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.ceil(amountInUSD * 100),
    currency: 'usd',
    metadata: {
      orderId,
    },
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
      const orderId = paymentIntent.metadata.orderId;
      if (!orderId) {
        console.error('Invalid request: missing orderId');
        return c.json({ error: 'Invalid request: missing orderId' }, 400);
      }

      const firestore = getFirestore();

      const driverCollection = firestore.collection('drivers') as CollectionReference<DriverEntity, DriverEntity>;
      const query = driverCollection
        .where('verificationStatus', '==', 'verified' as VerificationStatus)
        .orderBy('activeTasks', 'asc');
      const snapshot = await query.limit(1).get();
      const driverId = snapshot.empty ? null : snapshot.docs[0].id;
      const orderCollection = firestore.collection('orders') as CollectionReference<
        Partial<OrderEntity>,
        Partial<OrderEntity>
      >;
      await orderCollection.doc(orderId).set(
        {
          status: driverId ? OrderStatus.ASSIGNED_TO_DRIVER : OrderStatus.PAYMENT_RECEIVED,
          driverId,
          payment: {
            paymentIntentId: paymentIntent.id,
            amountInCents: `${paymentIntent.amount}`,
          },
        },
        { merge: true },
      );
      if (driverId) {
        const driverCollection = firestore.collection('drivers') as CollectionReference<DriverEntity, DriverEntity>;
        await driverCollection.doc(driverId).set(
          {
            activeTasks: FieldValue.increment(1),
          },
          { merge: true },
        );
      }
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
    timeoutSeconds: 5,
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
