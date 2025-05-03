export const FIREBASE_CONFIG_JSON = import.meta.env.VITE_FIREBASE_CONFIG_JSON;
export const STRIPE_CLIENT_SECRET = import.meta.env.VITE_STRIPE_CLIENT_SECRET;
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const isDevMode = import.meta.env.DEV;
export const isProdMode = import.meta.env.PROD;
export const APP_ENV: "dev" | "prod" | "local" =
  import.meta.env.VITE_APP_ENV || "local";
export const PUBLIC_WEBAPP_URL = import.meta.env.VITE_PUBLIC_WEBAPP_URL;
export const SERVER_API_ENDPOINT = import.meta.env.VITE_SERVER_API_ENDPOINT;
