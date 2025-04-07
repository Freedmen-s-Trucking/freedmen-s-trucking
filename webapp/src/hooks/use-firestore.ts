import { useCallback, useContext } from "react";
import { FireStoreProvider } from "../provider/firestore";
import {
  collection,
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  Query,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {
  DriverEntity,
  DriverOrderStatus,
  EntityWithPath,
  OrderEntity,
  OrderEntityFields,
  OrderStatus,
  PaymentEntity,
  PlatformOverviewEntity,
  UserEntity,
  CollectionName,
  LATEST_PLATFORM_OVERVIEW_PATH,
} from "@freedmen-s-trucking/types";
import { checkFalsyAndThrow } from "../utils/functions";

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
    async (order: OrderEntity) => {
      const uuid = generateUUID();
      const docRef = doc(collection(db, CollectionName.ORDERS), uuid);
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
      const docRef = doc(collection(db, CollectionName.ORDERS), orderId);
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
        const docRef = doc(collection(db, CollectionName.DRIVERS), userId);
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
      const docRef = doc(collection(db, CollectionName.USERS), user.uid);
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
      const docRef = doc(collection(db, CollectionName.USERS), uid);
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
      const docRef = doc(collection(db, CollectionName.USERS), uid);
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
      const docRef = doc(collection(db, CollectionName.DRIVERS), uid);
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
      const docRef = doc(collection(db, CollectionName.DRIVERS), uid);
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
              collection(db, CollectionName.ORDERS),
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
              collection(db, CollectionName.ORDERS),
              where(OrderEntityFields.ownerId, "==", uid),
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
              collection(db, CollectionName.ORDERS),
              where(OrderEntityFields.driverId, "==", uid),
              where(
                OrderEntityFields.driverStatus,
                "==",
                DriverOrderStatus.DELIVERED,
              ),
              limit(20),
            )
          : query(
              collection(db, CollectionName.ORDERS),
              where(OrderEntityFields.ownerId, "==", uid),
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

const useAdminDbOperations = (db: Firestore) => {
  /**
   * Fetches orders from the database.
   */
  const fetchOrders = useCallback(async () => {
    const q = query(collection(db, CollectionName.ORDERS));
    const res = await getDocs<OrderEntity, OrderEntity>(
      q as Query<OrderEntity, OrderEntity>,
    );
    const result = <{ path: string; data: OrderEntity }[]>[];

    res.forEach((doc) => {
      if (!doc.exists()) return;
      result.push({ path: doc.ref.path, data: doc.data() });
    });
    return result;
  }, [db]);

  /**
   * Fetches drivers from the database.
   * Note: Firebase security rules is the one responsible to grant access to the data, not client code.
   */
  const fetchDrivers = useCallback(async () => {
    const q = query(collection(db, CollectionName.DRIVERS));
    const driversQuerySnapshot = await getDocs<DriverEntity, DriverEntity>(
      q as Query<DriverEntity, DriverEntity>,
    );
    const result = <
      { path: string; data: DriverEntity & { user: UserEntity } }[]
    >[];

    for (const snapshot of driversQuerySnapshot.docs) {
      if (!snapshot.exists()) continue;

      const userDocRef = doc(collection(db, CollectionName.USERS), snapshot.id);
      const user = await getDoc<UserEntity, UserEntity>(
        userDocRef as DocumentReference<UserEntity, UserEntity>,
      );

      if (!user.exists()) continue;

      result.push({
        path: snapshot.ref.path,
        data: { ...snapshot.data(), user: user.data() },
      });
    }

    return result;
  }, [db]);

  /**
   * Fetches the overview of the platform.
   * Note: Firebase security rules is the one responsible to grant access to the data, not client code.
   */
  const fetchPlatformOverview = useCallback(
    async (
      onValue: (arg: EntityWithPath<PlatformOverviewEntity> | null) => void,
    ) => {
      const docRef = doc(db, LATEST_PLATFORM_OVERVIEW_PATH);
      const unsubscribe = onSnapshot<
        PlatformOverviewEntity,
        PlatformOverviewEntity
      >(
        docRef as DocumentReference<
          PlatformOverviewEntity,
          PlatformOverviewEntity
        >,
        (snapshot) => {
          const res = snapshot.exists()
            ? { path: docRef.path, data: snapshot.data() }
            : null;
          return onValue(res);
        },
      );
      return unsubscribe;
    },
    [db],
  );

  const fetchPayments = useCallback(async () => {
    const q = query(collection(db, CollectionName.PAYMENTS));
    const res = await getDocs<PaymentEntity, PaymentEntity>(
      q as Query<PaymentEntity, PaymentEntity>,
    );
    const result = <{ path: string; data: PaymentEntity }[]>[];

    res.forEach((doc) => {
      if (!doc.exists()) return;
      result.push({ path: doc.ref.path, data: doc.data() });
    });
    return result;
  }, [db]);

  return {
    fetchOrders,
    fetchDrivers,
    fetchPlatformOverview,
    fetchPayments,
  };
};

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

  const { fetchOrders, fetchDrivers, fetchPlatformOverview, fetchPayments } =
    useAdminDbOperations(db);

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
    fetchOrders,
    fetchDrivers,
    fetchPlatformOverview,
    fetchPayments,
  };
};
