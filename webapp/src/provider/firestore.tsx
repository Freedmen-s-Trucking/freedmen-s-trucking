import {
  Firestore,
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { createContext, useEffect, useMemo } from "react";
import { isDevMode } from "../utils/envs";

const FireStoreCtx = createContext<Firestore | null>(null);

const FireStoreProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const fireStore = useMemo(() => getFirestore(), []);

  useEffect(() => {
    if (isDevMode) {
      connectFirestoreEmulator(fireStore, "127.0.0.1", 8080);
    }
  }, [fireStore]);

  return (
    <FireStoreCtx.Provider value={fireStore}>{children}</FireStoreCtx.Provider>
  );
};

export { FireStoreProvider, FireStoreCtx };
