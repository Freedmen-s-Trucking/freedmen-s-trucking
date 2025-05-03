import Stripe from "stripe";
import {STRIPE_WEBHOOK_SECRET_CONNECTED_ACCOUNT, STRIPE_WEBHOOK_SECRET_SELF_ACCOUNT} from "~src/utils/envs";
import {parseStripeMeta} from "~src/utils/serialize";

type HandleWebhookEventResponse = Error | null;
interface HandleWebhookEventParams {
  getHeader: (name: string) => string | null | undefined;
  getRawBody: () => Promise<ArrayBuffer>;
  onPaymentIntentSucceeded?: (
    paymentIntent: Stripe.PaymentIntent,
    parsedMeta: Record<string, unknown>,
  ) => Promise<HandleWebhookEventResponse>;
  onAccountUpdated?: (account: Stripe.Account) => Promise<HandleWebhookEventResponse>;
}

/**
 * Handles a Stripe webhook event.
 *
 * @param {HandleWebhookEventParams} params - The parameters for the webhook event.
 * @param {Function} params.getHeader - A function that returns the value of a header.
 * @param {Function} params.getRawBody - A function that returns the raw body of the request.
 * @param {Function} params.onPaymentIntentSucceeded - A function that handles a payment intent succeeded event.
 * @param {Function} params.onAccountUpdated - A function that handles an account updated event.
 * @return {Promise<HandleWebhookEventResponse>} A promise that resolves to the result of the webhook event.
 */
export async function handleStripeWebhookEvent({
  getHeader,
  getRawBody,
  onPaymentIntentSucceeded,
  onAccountUpdated,
}: HandleWebhookEventParams): Promise<HandleWebhookEventResponse> {
  const sig = getHeader("stripe-signature");
  const arrayBuffer = await getRawBody();
  const buffer = Buffer.from(arrayBuffer);
  let event: Stripe.Event;

  try {
    event = Stripe.webhooks.constructEvent(buffer, sig || "", STRIPE_WEBHOOK_SECRET_SELF_ACCOUNT);
  } catch (errSelfAccount) {
    try {
      event = Stripe.webhooks.constructEvent(buffer, sig || "", STRIPE_WEBHOOK_SECRET_CONNECTED_ACCOUNT);
    } catch (errConnectedAccount) {
      console.error(errSelfAccount, errConnectedAccount);
      return new Error(
        `Webhook Error: ${(errSelfAccount as Error).message}` + ` ${(errConnectedAccount as Error).message}`,
      );
    }
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const parsedMeta = parseStripeMeta(paymentIntent.metadata);
      if (onPaymentIntentSucceeded) {
        return onPaymentIntentSucceeded(paymentIntent, parsedMeta);
      }
      break;
    // case 'account.external_account.updated':
    case "account.updated":
      const account = event.data.object;
      if (onAccountUpdated) {
        return onAccountUpdated(account);
      }
      break;
    default:
      console.warn(`Unhandled event type ${event.type}`);
      break;
  }

  return null;
}
