import { useCallback, useContext } from "react";
import { FireStoreProvider } from "../provider/firestore";
import { collection, doc, Firestore, getDoc, setDoc } from "firebase/firestore";
import { DriverEntity, UserEntity } from "@freedman-trucking/entities";
import { checkFalsyAndThrow } from "../utils/functions";

const COLLECTION_NAME_USERS = "users";
const COLLECTION_NAME_DRIVERS = "drivers";

const useFirestore = () => {
  const context = useContext(FireStoreProvider.Ctx);
  if (!context) {
    throw new Error("useFirestore must be used within a FireStoreProvider");
  }
  return context;
};

const useUserDbOperations = (db: Firestore) => {
  /**
   * Create user if he doesn't exist.
   */
  const createUser = useCallback(
    async (user: UserEntity) => {
      const docRef = doc(collection(db, COLLECTION_NAME_USERS), user.uid);
      const userSnapshot = await getDoc(docRef);
      if (!userSnapshot.exists()) {
        await setDoc(docRef, JSON.parse(JSON.stringify(user)));
      }
    },
    [db],
  );

  /**
   * Inserts user into the database.
   */
  const insertUser = useCallback(
    async (uid: string, user: Partial<UserEntity>) => {
      checkFalsyAndThrow({ uid, user }, "FirestoreError::insertUser");
      const docRef = doc(collection(db, COLLECTION_NAME_USERS), uid);
      await setDoc(docRef, JSON.parse(JSON.stringify(user)));
    },
    [db],
  );

  return { insertUser, createUser };
};

const useDriverDbOperations = (db: Firestore) => {
  /**
   * Inserts user into the database.
   */
  const updateDriverCertificates = useCallback(
    async (uid: string, certificates: string[]) => {
      checkFalsyAndThrow(
        { uid, certificates },
        "FirestoreError::updateDriverCertificates",
      );
      const docRef = doc(collection(db, COLLECTION_NAME_DRIVERS), uid);
      const driver: Partial<DriverEntity> = {
        uploadedCertificates: certificates.map((c) => ({
          value: c,
          type: "DRIVER_LICENSE",
        })),
      };
      await setDoc(docRef, driver);
    },
    [db],
  );

  return { updateDriverCertificates };
};

export const useDbOperations = () => {
  const db = useFirestore();

  const { insertUser, createUser } = useUserDbOperations(db);
  const { updateDriverCertificates } = useDriverDbOperations(db);

  return { insertUser, createUser, updateDriverCertificates };
};
