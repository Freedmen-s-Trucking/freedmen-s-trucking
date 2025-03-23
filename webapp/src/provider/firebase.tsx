import { FirebaseApp, initializeApp } from "firebase/app";
import { createContext, useMemo } from "react";
// import firebaseConfig from "../assets/configs/firebase.json";
import { FIREBASE_CONFIG_JSON } from "../utils/envs";

const Firebase = createContext<FirebaseApp | null>(null);

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
export const FirebaseProvider: React.FC<{
  children: React.ReactNode;
}> & { Ctx: React.Context<FirebaseApp | null> } = ({ children }) => {
  const app = useMemo(_initializeFirebaseApp, []);

  return <Firebase.Provider value={app}>{children}</Firebase.Provider>;
};

FirebaseProvider.Ctx = Firebase;
