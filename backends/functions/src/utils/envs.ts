export const ENV_STRIPE_SECRET_KEY = (() => {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY not found, check your environment variables");
  }
  return secret;
})();

export const ENV_OPENAI_API_KEY = (() => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY not found, check your environment variables");
  }
  return key;
})();

export const ENV_STRIPE_WEBHOOK_SECRET_SELF_ACCOUNT = (() => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET_SELF_ACCOUNT;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET_SELF_ACCOUNT not found, check your environment variables");
  }
  return secret;
})();

export const ENV_STRIPE_WEBHOOK_SECRET_CONNECTED_ACCOUNT = (() => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET_CONNECTED_ACCOUNT;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET_CONNECTED_ACCOUNT not found, check your environment variables");
  }
  return secret;
})();

export const ENV_PUBLIC_WEBAPP_URL = (() => {
  const url = process.env.PUBLIC_WEBAPP_URL;
  if (!url) {
    throw new Error("PUBLIC_WEBAPP_URL not found, check your environment variables");
  }
  return url;
})();

export const ENV_SEND_GRID_API_KEY = (() => {
  const key = process.env.SEND_GRID_API_KEY;
  if (!key) {
    throw new Error("SEND_GRID_API_KEY not found, check your environment variables");
  }
  return key;
})();
