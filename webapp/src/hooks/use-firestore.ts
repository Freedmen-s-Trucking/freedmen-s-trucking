import { useCallback, useContext } from "react";
import { FireStoreProvider } from "../provider/firestore";
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  increment,
  limit,
  Query,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {
  DriverEntity,
  DriverOrderStatus,
  OrderEntity,
  OrderEntityFields,
  OrderStatus,
  UserEntity,
} from "@freedman-trucking/types";
import { checkFalsyAndThrow } from "../utils/functions";

const COLLECTION_NAME_USERS = "users";
const COLLECTION_NAME_DRIVERS = "drivers";
const COLLECTION_NAME_ORDER = "orders";
// const COLLECTION_NAME_NOTIFICATIONS = "notifications";

const useFirestore = () => {
  const context = useContext(FireStoreProvider.Ctx);
  if (!context) {
    throw new Error("useFirestore must be used within a FireStoreProvider");
  }
  return context;
};

function generateUUID() {
  if (typeof crypto === "object") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      const d = new Uint8Array(16);
      crypto.getRandomValues(d);
      d[6] = (d[6] & 0x0f) | 0x40; // Set version to 4
      d[8] = (d[8] & 0x3f) | 0x80; // Set variant to RFC4122
      const uuid = [...d].map((x) => ("0" + x.toString(16)).slice(-2)).join("");
      return (
        uuid.slice(0, 8) +
        "-" +
        uuid.slice(8, 12) +
        "-" +
        uuid.slice(12, 16) +
        "-" +
        uuid.slice(16, 20) +
        "-" +
        uuid.slice(20)
      );
    }
  }
  return (
    Math.random().toString(36).substring(0, 8) +
    "-" +
    Math.random().toString(36).substring(8, 12) +
    "-" +
    Math.random().toString(36).substring(12, 16) +
    "-" +
    Math.random().toString(36).substring(16, 20) +
    "-" +
    Date.now().toString()
  );
}

const useOrderDbOperations = (db: Firestore) => {
  /**
   * Create order if it doesn't exist.
   */
  const createOrder = useCallback(
    async (order: Omit<OrderEntity, "id">) => {
      const uuid = generateUUID();
      const docRef = doc(collection(db, COLLECTION_NAME_ORDER), uuid);
      await setDoc(docRef, JSON.parse(JSON.stringify(order)), {
        merge: true,
      });
      return uuid;
    },
    [db],
  );

  /**
   * Update order.
   */
  const updateOrderStatus = useCallback(
    async (
      userId: string,
      orderPath: string,
      driverStatus: DriverOrderStatus,
    ) => {
      checkFalsyAndThrow(
        { userId, orderPath, driverStatus },
        "FirestoreError::updateOrderStatus",
      );
      const orderId = orderPath.split("/").pop();
      const docRef = doc(collection(db, COLLECTION_NAME_ORDER), orderId);
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        throw new Error("Order not found");
      }
      const prevOrder = docSnapshot.data() as OrderEntity;
      if (userId !== prevOrder.driverId) {
        throw new Error("Unauthorized");
      }
      // TODO: Validate status
      const dataToUpdate: Partial<OrderEntity> = {
        driverStatus: driverStatus,
        status:
          driverStatus === DriverOrderStatus.DELIVERED
            ? OrderStatus.COMPLETED
            : prevOrder.status,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, dataToUpdate, {
        merge: true,
      });

      if (driverStatus === DriverOrderStatus.DELIVERED) {
        const docRef = doc(collection(db, COLLECTION_NAME_DRIVERS), userId);
        const docSnapshot = await getDoc(docRef);
        if (!docSnapshot.exists()) {
          throw new Error("Driver not found");
        }
        await setDoc<Partial<DriverEntity>, Partial<DriverEntity>>(
          docRef,
          {
            tasksCompleted: increment(1),
            activeTasks: increment(-1),
          },
          {
            merge: true,
          },
        );
      }
    },
    [db],
  );

  return { createOrder, updateOrderStatus };
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
        await setDoc(docRef, JSON.parse(JSON.stringify(user)), { merge: true });
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
      await setDoc(docRef, JSON.parse(JSON.stringify(user)), { merge: true });
    },
    [db],
  );

  /**
   * Get user from the database.
   */
  const getUser = useCallback(
    async (uid: string) => {
      checkFalsyAndThrow({ uid }, "FirestoreError::getUser");
      const docRef = doc(collection(db, COLLECTION_NAME_USERS), uid);
      const userSnapshot = await getDoc(docRef);
      if (userSnapshot.exists()) {
        return userSnapshot.data() as UserEntity;
      }
      return null;
    },
    [db],
  );

  return { insertUser, createUser, getUser };
};

const useDriverDbOperations = (db: Firestore) => {
  /**
   * Updates driver in the database.
   */
  const updateDriver = useCallback(
    async (uid: string, driver: Partial<DriverEntity>) => {
      checkFalsyAndThrow(
        { uid, driver },
        "FirestoreError::updateDriverCertificates",
      );
      const docRef = doc(collection(db, COLLECTION_NAME_DRIVERS), uid);
      await setDoc(docRef, JSON.parse(JSON.stringify(driver)), { merge: true });
    },
    [db],
  );

  const getDriver = useCallback(
    async (uid: string) => {
      checkFalsyAndThrow(
        { uid },
        "FirestoreError::getDriver uid must not be falsy",
      );
      const docRef = doc(collection(db, COLLECTION_NAME_DRIVERS), uid);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return docSnapshot.data() as DriverEntity;
      }
      return null;
    },
    [db],
  );

  /**
   * Fetches active orders user orders into the database.
   */
  const fetchCurrentActiveOrders = useCallback(
    async (uid: string, userType: "client" | "driver") => {
      checkFalsyAndThrow({ uid }, "FirestoreError::fetchCurrentActiveOrders");
      const q =
        userType === "driver"
          ? query(
              collection(db, COLLECTION_NAME_ORDER),
              where(OrderEntityFields.driverId, "==", uid),
              where(
                OrderEntityFields.status,
                "==",
                OrderStatus.ASSIGNED_TO_DRIVER,
              ),
              where(
                OrderEntityFields.driverStatus,
                "!=",
                DriverOrderStatus.DELIVERED,
              ),
              limit(10),
            )
          : query(
              collection(db, COLLECTION_NAME_ORDER),
              where(OrderEntityFields.clientId, "==", uid),
              where(OrderEntityFields.status, "!=", OrderStatus.COMPLETED),
              // TODO: handle pending payment directly with stripe.
              // where(
              //   OrderEntityFields.status,
              //   "!=",
              //   OrderStatus.PENDING_PAYMENT,
              // ),
              limit(10),
            );
      const res = await getDocs<OrderEntity, OrderEntity>(
        q as Query<OrderEntity, OrderEntity>,
      );

      const result = <{ path: string; data: OrderEntity }[]>[];

      res.forEach((doc) => {
        if (!doc.exists()) return;
        result.push({ path: doc.ref.path, data: doc.data() });
      });
      return result;
    },
    [db],
  );

  /**
   * Fetches recent user orders into the database.
   */
  const fetchCompletedOrder = useCallback(
    async (uid: string, userType: "client" | "driver") => {
      checkFalsyAndThrow({ uid }, "FirestoreError::fetchCurrentActiveOrders");
      const q =
        userType === "driver"
          ? query(
              collection(db, COLLECTION_NAME_ORDER),
              where(OrderEntityFields.driverId, "==", uid),
              where(
                OrderEntityFields.driverStatus,
                "==",
                DriverOrderStatus.DELIVERED,
              ),
              limit(20),
            )
          : query(
              collection(db, COLLECTION_NAME_ORDER),
              where(OrderEntityFields.clientId, "==", uid),
              where(OrderEntityFields.status, "==", OrderStatus.COMPLETED),
              limit(20),
            );
      const res = await getDocs<OrderEntity, OrderEntity>(
        q as Query<OrderEntity, OrderEntity>,
      );
      const result = <{ path: string; data: OrderEntity }[]>[];

      res.forEach((doc) => {
        if (!doc.exists()) return;
        result.push({ path: doc.ref.path, data: doc.data() });
      });
      return result;
    },
    [db],
  );

  return {
    updateDriver,
    getDriver,
    fetchCompletedOrder,
    fetchCurrentActiveOrders,
  };
};

// export const useNotificationDbOperations = (db: Firestore) => {
//   const fetchNotifications = useCallback(
//     async (uid: string) => {
//       checkFalsyAndThrow({ uid }, "FirestoreError::fetchNotifications");
//       const q = query(
//         collection(db, COLLECTION_NAME_NOTIFICATIONS),
//         where(NotificationEntityFields.userId, "==", uid),
//       );
//       return getDocs<NotificationEntity, NotificationEntity>(
//         q as Query<NotificationEntity, NotificationEntity>,
//       );
//     },
//     [db],
//   );
//   return { fetchNotifications };
// };

export const useDbOperations = () => {
  const db = useFirestore();

  const { createOrder, updateOrderStatus } = useOrderDbOperations(db);

  const { insertUser, createUser, getUser } = useUserDbOperations(db);
  const {
    updateDriver,
    getDriver,
    fetchCompletedOrder,
    fetchCurrentActiveOrders,
  } = useDriverDbOperations(db);
  // const { fetchNotifications } = useNotificationDbOperations(db);

  return {
    insertUser,
    createOrder,
    createUser,
    fetchCompletedOrder,
    fetchCurrentActiveOrders,
    getUser,
    updateDriver,
    getDriver,
    updateOrderStatus,
  };
};
