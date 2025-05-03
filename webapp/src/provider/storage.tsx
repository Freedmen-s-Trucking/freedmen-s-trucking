import { createContext, useEffect, useMemo } from "react";
import { isDevMode } from "~/utils/envs";
import {
  FirebaseStorage,
  getStorage,
  connectStorageEmulator,
} from "firebase/storage";

const StorageCtx = createContext<FirebaseStorage | null>(null);

const StorageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const storage = useMemo(() => getStorage(), []);

  useEffect(() => {
    if (isDevMode) {
      const location = new URL(window.location.href);
      connectStorageEmulator(storage, location.hostname, 9199);
    }
  }, [storage]);

  return <StorageCtx.Provider value={storage}>{children}</StorageCtx.Provider>;
};

export { StorageProvider, StorageCtx };
