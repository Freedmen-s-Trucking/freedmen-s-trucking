import { FirebaseApp, initializeApp } from "firebase/app";
import { createContext, useMemo } from "react";
import { FIREBASE_CONFIG_JSON } from "~/utils/envs";

const FirebaseCtx = createContext<FirebaseApp | null>(null);
console.log("FIREBASE_CONFIG_JSON", FIREBASE_CONFIG_JSON);


const _initializeFirebaseApp = () => {

  try {
    const config = JSON.parse(FIREBASE_CONFIG_JSON);
    console.log("config", config);
    console.log("initializing firebase app!!!!!!!", config);
    return initializeApp(config);
  } catch (e) {
    console.error("Failed to initialize Firebase:", e);
    console.info("Environment variables:", {
      configPresent: !!FIREBASE_CONFIG_JSON,
      configType: typeof FIREBASE_CONFIG_JSON,
      configValue: FIREBASE_CONFIG_JSON
    });
    throw e;
  }
};

const FirebaseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const app = useMemo(_initializeFirebaseApp, []);

  return <FirebaseCtx.Provider value={app}>{children}</FirebaseCtx.Provider>;
};

export { FirebaseProvider, FirebaseCtx };
