import { FirebaseApp, initializeApp } from "firebase/app";
import { createContext, useMemo } from "react";
import { FIREBASE_CONFIG_JSON } from "~/utils/envs";

const FirebaseCtx = createContext<FirebaseApp | null>(null);

const _initializeFirebaseApp = () => {
  if (!FIREBASE_CONFIG_JSON) {
    throw new Error("VITE_FIREBASE_CONFIG_JSON is undefined. Please check your .env file.");
  }

  let config;
  try {
    config = JSON.parse(FIREBASE_CONFIG_JSON);
  } catch (e) {
    console.error("❌ Failed to parse VITE_FIREBASE_CONFIG_JSON", e);
    throw new Error("Invalid JSON in VITE_FIREBASE_CONFIG_JSON");
  }

  return initializeApp(config);
};

const FirebaseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const app = useMemo(_initializeFirebaseApp, []);

  return <FirebaseCtx.Provider value={app}>{children}</FirebaseCtx.Provider>;
};

export { FirebaseProvider, FirebaseCtx };
