import { useCallback, useContext } from "react";
import { StorageProvider } from "../provider/storage";
import { ref, uploadBytes } from "firebase/storage";

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
  const uploadDriverCertificates = useCallback(
    async (uid: string, licenses: File[]) => {
      if (!uid || uid.trim().length === 0) {
        throw new Error("FStorageError:: The uid must not be empty");
      }
      const userStorageRef = ref(storage, `drivers-certifications/${uid}`);

      const promises: Promise<string>[] = [];
      for (const [index, license] of Object.entries(licenses)) {
        if (license.type.startsWith("image/")) {
          const storageRef = ref(userStorageRef, `${index}`);
          const res = uploadBytes(storageRef, license).then((snapshot) => {
            console.log({ snapshot });
            console.log("Uploaded a blob or file!");
            return snapshot.ref.fullPath;
          });
          promises.push(res);
        }
      }

      return await Promise.all(promises);
    },
    [storage],
  );

  return { uploadDriverCertificates };
};
