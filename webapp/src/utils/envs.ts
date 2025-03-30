export const FIREBASE_CONFIG_JSON = import.meta.env.VITE_FIREBASE_CONFIG_JSON;
export const STRIPE_CLIENT_SECRET = import.meta.env.VITE_STRIPE_CLIENT_SECRET;

export const isDevMode = import.meta.env.DEV;
export const isProdMode = import.meta.env.PROD;
export const APP_ENV: "dev" | "prod" = import.meta.env.VITE_APP_ENV || "dev";
