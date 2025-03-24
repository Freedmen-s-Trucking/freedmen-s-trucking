import { useCallback, useContext } from "react";
import { StorageProvider } from "../provider/storage";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { checkFalsyAndThrow } from "@/utils/functions";

const useStorage = () => {
  const context = useContext(StorageProvider.Ctx);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};

export const useStorageOperations = () => {
  const storage = useStorage();

  /**
   * Uploads the provided image
   */
  const uploadCertificate = useCallback(
    async (
      uid: string,
      license: File,
      type: "driver-license" | "driver-insurance",
    ) => {
      checkFalsyAndThrow(
        { uid, license, type },
        "FStorageError:: The uid or license must not be empty or null or undefined",
      );
      const userStorageRef = ref(storage, `drivers-certifications/${uid}`);

      if (license.type.startsWith("image/")) {
        const storageRef = ref(userStorageRef, type);
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

  return { uploadCertificate, fetchImage };
};
