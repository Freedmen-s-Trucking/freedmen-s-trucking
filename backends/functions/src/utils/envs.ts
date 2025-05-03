export const STRIPE_SECRET_KEY = (() => {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY not found, check your environment variables");
  }
  return secret;
})();

export const OPENAI_API_KEY = (() => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY not found, check your environment variables");
  }
  return key;
})();

export const STRIPE_WEBHOOK_SECRET_SELF_ACCOUNT = (() => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET_SELF_ACCOUNT;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET_SELF_ACCOUNT not found, check your environment variables");
  }
  return secret;
})();

export const STRIPE_WEBHOOK_SECRET_CONNECTED_ACCOUNT = (() => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET_CONNECTED_ACCOUNT;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET_CONNECTED_ACCOUNT not found, check your environment variables");
  }
  return secret;
})();
