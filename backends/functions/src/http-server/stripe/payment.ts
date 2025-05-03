import type Stripe from "stripe";
import {
  type,
  ApiReqScheduleDeliveryIntent,
  ApiResSetupConnectedAccount,
  DriverEntity,
  CollectionName,
  OrderEntity,
  PaymentEntity,
  EntityWithID,
  newOrderEntity,
  OrderEntityFields,
} from "@freedmen-s-trucking/types";
import stripe from "./config";
import {serializeToStripeMeta} from "~src/utils/serialize";
import {CollectionReference, DocumentReference, getFirestore} from "firebase-admin/firestore";
import {DecodedIdToken} from "firebase-admin/auth";

type CreatePaymentIntentResponse = Stripe.Response<Stripe.PaymentIntent> | Error;

/**
 * Creates a Stripe PaymentIntent for a given order
 * @param {ApiReqScheduleDeliveryIntent | null} args - The order data to create the PaymentIntent for
 * @param {DecodedIdToken} authUser - The user who is creating the PaymentIntent
 */
export async function createPaymentIntent(
  args: ApiReqScheduleDeliveryIntent | null,
  authUser: DecodedIdToken,
): Promise<CreatePaymentIntentResponse> {
  const validatedData = newOrderEntity({
    ...(args?.metadata || {}),
    [OrderEntityFields.ownerId]: authUser.uid,
  });
  if (validatedData instanceof type.errors) {
    return new Error(validatedData.summary);
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.ceil(validatedData.priceInUSD * 100),
    currency: "usd",
    metadata: serializeToStripeMeta(validatedData),
  });

  return paymentIntent;
}

/**
 * Creates a Stripe Connect account for a given driver
 * @param {ApiResSetupConnectedAccount} driver - The driver data to create the Connect account for
 * @param {DecodedIdToken} authUser - The user who is creating the Connect account
 */
async function createStripeConnectedAccount(
  driver: ApiResSetupConnectedAccount,
  authUser: DecodedIdToken,
): Promise<Stripe.Response<Stripe.Account> | Error> {
  const account = await stripe.accounts.create({
    country: "US",
    email: authUser.email || undefined,
    capabilities: {
      transfers: {
        requested: true,
      },
    },
    metadata: {
      driverId: authUser.uid,
      email: authUser.email || null,
    },
    controller: {
      losses: {
        payments: "application",
      },
      fees: {
        payer: "application",
      },
      stripe_dashboard: {
        type: "express",
      },
    },
  });
  const firestore = getFirestore();

  const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  await driverCollection.doc(authUser.uid).update({
    stripeConnectAccountId: account.id,
  });
  return account;
}

/**
 * Generates a Stripe Connect account link for a given driver
 * @param {ApiResSetupConnectedAccount} driver - The driver data to generate the link for
 * @param {DecodedIdToken} authUser - The user who is generating the link
 */
export async function generateConnectedAccountSetupLink(
  driver: ApiResSetupConnectedAccount,
  authUser: DecodedIdToken,
): Promise<Stripe.Response<Stripe.AccountLink> | Error> {
  if (!driver.stripeConnectAccountId) {
    const connectAccount = await createStripeConnectedAccount(driver, authUser);
    if (connectAccount instanceof Error) {
      return connectAccount;
    }
    console.log({connectAccount});
    driver.stripeConnectAccountId = connectAccount.id;
  }
  const accountLink = await stripe.accountLinks.create({
    account: driver.stripeConnectAccountId || "",
    refresh_url: driver.refreshUrl,
    return_url: driver.returnUrl,
    type: "account_onboarding",
  });

  return accountLink;
}

/**
 * Transfers funds to a driver's Stripe Connect account
 * @param {DriverEntity} driver - The driver data to transfer funds to
 * @param {number} amountInUSD - The amount of money to transfer
 * @param {EntityWithID<OrderEntity>} order - The order data related to the transfer
 * @param {string} taskId - The task ID related to the transfer
 */
export async function transferFundsToDriver(
  driver: DriverEntity,
  amountInUSD: number,
  order: EntityWithID<OrderEntity>,
  taskId: keyof OrderEntity,
): Promise<Stripe.Response<Stripe.Transfer> | Error> {
  if (!driver.stripeConnectAccountId) {
    return new Error("Driver has no Stripe Connect account");
  }

  const payment = await (getFirestore().doc(order.data.paymentRef) as DocumentReference<PaymentEntity>).get();
  const paymentIntentId = payment.data()?.provider?.ref;
  if (!paymentIntentId) {
    return new Error("Payment intent not found");
  }
  const orderPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const transfer = await stripe.transfers.create({
    amount: Math.ceil(amountInUSD * 100),
    currency: "usd",
    destination: driver.stripeConnectAccountId || "",
    transfer_group: order.id,
    source_transaction: !orderPaymentIntent.latest_charge
      ? "N/A"
      : typeof orderPaymentIntent.latest_charge === "string"
        ? orderPaymentIntent.latest_charge
        : orderPaymentIntent.latest_charge.id,
    metadata: serializeToStripeMeta({
      driverId: driver.uid,
      orderId: order.id,
      taskId,
    }),
  });
  return transfer;
}
