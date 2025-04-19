import { FirebaseApp, initializeApp } from "firebase/app";
import { createContext, useMemo } from "react";
import { FIREBASE_CONFIG_JSON } from "~/utils/envs";

const FirebaseCtx = createContext<FirebaseApp | null>(null);

const _initializeFirebaseApp = () => {
  try {
    const config = JSON.parse(FIREBASE_CONFIG_JSON);
    return initializeApp(config);
  } catch (e) {
    console.error("failed to parse firebase app", e);
    console.info(import.meta.env);
    return initializeApp();
  }
};

const FirebaseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const app = useMemo(_initializeFirebaseApp, []);

  return <FirebaseCtx.Provider value={app}>{children}</FirebaseCtx.Provider>;
};

export { FirebaseProvider, FirebaseCtx };
