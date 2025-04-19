import type Stripe from 'stripe';
import {
  type,
  apiReqScheduleDeliveryIntent,
  ApiReqScheduleDeliveryIntent,
  ApiResSetupConnectedAccount,
  DriverEntity,
  CollectionName,
} from '@freedmen-s-trucking/types';
import stripe from './config';
import { serializeToStripeMeta } from '~src/utils/serialize';
import { CollectionReference, getFirestore } from 'firebase-admin/firestore';

type CreatePaymentIntentResponse = Stripe.Response<Stripe.PaymentIntent> | Error;

export async function createPaymentIntent(
  args: ApiReqScheduleDeliveryIntent | unknown,
): Promise<CreatePaymentIntentResponse> {
  const validatedData = apiReqScheduleDeliveryIntent(args);
  if (validatedData instanceof type.errors) {
    return new Error(validatedData.summary);
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.ceil(validatedData.metadata.priceInUSD * 100),
    currency: 'usd',
    metadata: serializeToStripeMeta(validatedData.metadata),
  });

  return paymentIntent;
}

export async function createStripeConnectedAccount(
  driver: ApiResSetupConnectedAccount,
): Promise<Stripe.Response<Stripe.Account> | Error> {
  const account = await stripe.accounts.create({
    country: 'US',
    email: driver.email || undefined,
    capabilities: {
      transfers: {
        requested: true,
      },
    },
    metadata: {
      driverId: driver.uid,
      email: driver.email,
    },
    controller: {
      losses: {
        payments: 'application',
      },
      fees: {
        payer: 'application',
      },
      stripe_dashboard: {
        type: 'express',
      },
    },
  });
  const firestore = getFirestore();

  const driverCollection = firestore.collection(CollectionName.DRIVERS) as CollectionReference<
    DriverEntity,
    DriverEntity
  >;
  await driverCollection.doc(driver.uid).update({
    stripeConnectAccountId: account.id,
  });
  return account;
}

export async function generateConnectedAccountSetupLink(
  driver: ApiResSetupConnectedAccount,
): Promise<Stripe.Response<Stripe.AccountLink> | Error> {
  if (!driver.stripeConnectAccountId) {
    const connectAccount = await createStripeConnectedAccount(driver);
    if (connectAccount instanceof Error) {
      return connectAccount;
    }
    console.log({ connectAccount });
    driver.stripeConnectAccountId = connectAccount.id;
  }
  const accountLink = await stripe.accountLinks.create({
    account: driver.stripeConnectAccountId || '',
    refresh_url: driver.refreshUrl,
    return_url: driver.returnUrl,
    type: 'account_onboarding',
  });

  return accountLink;
}
