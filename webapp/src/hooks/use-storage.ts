import { useCallback, useContext } from "react";
import { StorageCtx } from "~/provider/storage";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { checkFalsyAndThrow } from "~/utils/functions";
import { type } from "arktype";

const useStorage = () => {
  const context = useContext(StorageCtx);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};

export const useStorageOperations = () => {
  const storage = useStorage();

  /**
   * Uploads the provided package capture
   */
  const uploadOrderPackageDelivered = useCallback(
    async (orderId: string, packageCapture: File) => {
      checkFalsyAndThrow(
        { orderId, packageCapture },
        "FStorageError:: The orderId or packageCapture must not be empty or null or undefined",
      );
      const orderStorageRef = ref(storage, `orders/${orderId}`);

      if (packageCapture.type.startsWith("image/")) {
        const storageRef = ref(orderStorageRef, `package-delivered`);
        const res = uploadBytes(storageRef, packageCapture).then((snapshot) => {
          console.log({ snapshot });
          console.log("Uploaded a blob or file!");
          return snapshot.ref.fullPath;
        });
        return res;
      }

      throw new Error("FStorageError:: Invalid file type");
    },
    [storage],
  );

  /**
   * Uploads the provided profile image
   */
  const uploadProfile = useCallback(
    async (uid: string, profile: File) => {
      checkFalsyAndThrow(
        { uid, profile },
        "FStorageError:: The uid or profile must not be empty or null or undefined",
      );
      const userStorageRef = ref(storage, `users/${uid}`);

      if (profile.type.startsWith("image/")) {
        const storageRef = ref(userStorageRef, `profile-${Date.now()}`);
        const res = uploadBytes(storageRef, profile).then((snapshot) => {
          console.log({ snapshot });
          console.log("Uploaded a blob or file!");
          return snapshot.ref.fullPath;
        });
        return res;
      }

      throw new Error("FStorageError:: Invalid file type");
    },
    [storage],
  );

  /**
   * Uploads the provided image
   */
  const uploadCertificate = useCallback(
    async (
      uid: string,
      license: File,
      docType:
        | "driver-license-front"
        | "driver-license-back"
        | "driver-insurance",
    ) => {
      checkFalsyAndThrow(
        { uid, license, type: docType },
        "FStorageError:: The uid or license must not be empty or null or undefined",
        type({
          uid: "string",
          license: "File",
          type: "string",
        }),
      );
      const userStorageRef = ref(storage, `drivers-certifications/${uid}`);

      if (license.type.startsWith("image/")) {
        const storageRef = ref(userStorageRef, `${docType}`);
        const res = uploadBytes(storageRef, license).then((snapshot) => {
          console.log({ snapshot });
          console.log("Uploaded a blob or file!");
          return snapshot.ref.fullPath;
        });
        return res;
      }

      throw new Error("FStorageError:: Invalid file type");
    },
    [storage],
  );

  const fetchImage = useCallback(
    async (path: string) => {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    },
    [storage],
  );

  return {
    uploadCertificate,
    fetchImage,
    uploadProfile,
    uploadOrderPackageDelivered,
  };
};
