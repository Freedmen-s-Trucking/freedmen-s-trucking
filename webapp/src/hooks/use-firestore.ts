import { useCallback, useContext } from "react";
import { FireStoreCtx } from "~/provider/firestore";
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
  PartialWithFieldValue,
  Query,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  WithFieldValue,
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
  LATEST_PLATFORM_SETTINGS_PATH,
  PlatformSettingsEntity,
  type,
  userEntity,
  driverEntity,
  Coordinate,
  platformSettingsEntity,
  coordinateType,
} from "@freedmen-s-trucking/types";
import { validateOrFail } from "~/utils/functions";
import { driverEntityConverter } from "~/utils/firestore";

const useFirestore = () => {
  const context = useContext(FireStoreCtx);
  if (!context) {
    throw new Error("useFirestore must be used within a FireStoreProvider");
  }
  return context;
};

const useOrderDbOperations = (db: Firestore) => {
  /**
   * Update order.
   */
  const updateOrderStatus = useCallback(
    async (params: {
      userId: string;
      orderPath: string;
      driverStatus: DriverOrderStatus;
      coords: Coordinate | undefined;
      driverConfirmationCode?: string;
      deliveredOrderConfirmationImage?: string | null;
    }) => {
      const {
        userId,
        orderPath,
        driverStatus,
        coords,
        driverConfirmationCode,
        deliveredOrderConfirmationImage,
      } = validateOrFail(
        params,
        type({
          userId: "string",
          orderPath: "string",
          driverStatus: type.valueOf(DriverOrderStatus),
          coords: coordinateType.optional(),
          driverConfirmationCode: "string?",
          deliveredOrderConfirmationImage: "string | null ?",
        }),
        "FirestoreError::updateOrderStatus",
      );
      const orderId = orderPath.split("/").pop();
      const docRef = doc(collection(db, CollectionName.ORDERS), orderId);
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        throw new Error("Order not found");
      }
      const prevOrder = docSnapshot.data() as OrderEntity;
      if (userId !== prevOrder[OrderEntityFields.task]?.driverId) {
        throw new Error("Unauthorized");
      }

      if (
        driverStatus === DriverOrderStatus.DELIVERED &&
        (!driverConfirmationCode || !deliveredOrderConfirmationImage)
      ) {
        throw new Error("Invalid order status");
      }
      // TODO: Validate status
      await updateDoc(docRef, {
        [`${OrderEntityFields.task}.${OrderEntityFields.driverStatus}`]:
          driverStatus,
        ...(!!driverConfirmationCode && {
          [`${OrderEntityFields.task}.${OrderEntityFields.driverConfirmationCode}`]:
            driverConfirmationCode,
        }),
        ...(!!deliveredOrderConfirmationImage && {
          [`${OrderEntityFields.task}.${OrderEntityFields.deliveredOrderConfirmationImage}`]:
            deliveredOrderConfirmationImage,
        }),
        [`${OrderEntityFields.task}.${OrderEntityFields.updatedAt}`]:
          serverTimestamp(),
        [`${OrderEntityFields.task}.${OrderEntityFields.driverPositions}.${driverStatus}`]:
          coords,
      });

      // TODO: Verify if driver tasks are updated by the backend.
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

  return { updateOrderStatus: updateOrderStatus };
};

const useUserDbOperations = (db: Firestore) => {
  /**
   * Create user if he doesn't exist.
   */
  const createUser = useCallback(
    async (user: UserEntity) => {
      validateOrFail(
        { user },
        type({
          user: userEntity,
        }),
        "FirestoreError::createUser",
      );
      const docRef = doc(collection(db, CollectionName.USERS), user.uid);
      const userSnapshot = await getDoc(docRef);
      if (!userSnapshot.exists()) {
        await setDoc(docRef, user, { merge: true });
      }
    },
    [db],
  );

  /**
   * Inserts user into the database.
   */
  const insertUser = useCallback(
    async (uid: string, user: Partial<UserEntity>) => {
      validateOrFail(
        { uid, user },
        type({
          uid: "string",
          user: userEntity.partial(),
        }),
        "FirestoreError::insertUser",
      );
      const docRef = doc(collection(db, CollectionName.USERS), uid);
      await setDoc(docRef, user, { merge: true });
    },
    [db],
  );

  /**
   * Get user from the database.
   */
  const getUser = useCallback(
    async (uid: string) => {
      validateOrFail(
        { uid },
        type({
          uid: "string",
        }),
        "FirestoreError::getUser",
      );
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
    async (uid: string, driver: PartialWithFieldValue<DriverEntity>) => {
      validateOrFail(
        { uid, driver },
        type({
          uid: "string",
          driver: driverEntity.partial(),
        }),
        "FirestoreError::updateDriver",
      );
      const docRef = doc(
        collection(db, CollectionName.DRIVERS),
        uid,
      ).withConverter(driverEntityConverter);

      if (driver.latestLocation) {
        driver.latestLocation = {
          ...driver.latestLocation,
          timestamp: serverTimestamp(),
        } as WithFieldValue<DriverEntity["latestLocation"]>;
      }
      await setDoc(docRef, driver, { merge: true });
    },
    [db],
  );

  const getDriver = useCallback(
    async (uid: string) => {
      validateOrFail(
        { uid },
        type({
          uid: "string",
        }),
        "FirestoreError::getDriver uid must not be falsy",
      );
      const docRef = doc(
        collection(db, CollectionName.DRIVERS),
        uid,
      ).withConverter(driverEntityConverter);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return docSnapshot.data();
      }
      return null;
    },
    [db],
  );

  const watchDriver = useCallback(
    (uid: string, onValue: (driver: DriverEntity | null) => void) => {
      validateOrFail(
        { uid },
        type({
          uid: "string",
        }),
        "FirestoreError::watchDriver uid must not be falsy",
      );
      const docRef = doc(
        collection(db, CollectionName.DRIVERS),
        uid,
      ).withConverter(driverEntityConverter);
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          onValue(snapshot.data());
        } else {
          onValue(null);
        }
      });
      return unsubscribe;
    },
    [db],
  );

  /**
   * Fetches active orders user orders into the database.
   */
  const fetchCurrentActiveOrders = useCallback(
    (
      uid: string,
      userType: "client" | "driver",
      onValue: (orders: { path: string; data: OrderEntity }[]) => void,
    ) => {
      validateOrFail(
        { uid, userType },
        type({
          uid: "string",
          userType: "'client' | 'driver'",
        }),
        "FirestoreError::fetchCurrentActiveOrders",
      );
      const q =
        userType === "driver"
          ? query(
              collection(db, CollectionName.ORDERS),
              where(
                OrderEntityFields.assignedDriverId satisfies keyof OrderEntity,
                "==",
                uid,
              ),
              where(
                OrderEntityFields.status satisfies keyof OrderEntity,
                "!=",
                OrderStatus.COMPLETED,
              ),
              limit(10),
            )
          : query(
              collection(db, CollectionName.ORDERS),
              where(
                OrderEntityFields.ownerId satisfies keyof OrderEntity,
                "==",
                uid,
              ),
              where(
                OrderEntityFields.status satisfies keyof OrderEntity,
                "!=",
                OrderStatus.COMPLETED,
              ),
              // TODO: handle pending payment directly with stripe.
              // where(
              //   OrderEntityFields.status,
              //   "!=",
              //   OrderStatus.PENDING_PAYMENT,
              // ),
              limit(10),
            );

      return onSnapshot(q, (snapshot) => {
        const result = <{ path: string; data: OrderEntity }[]>[];
        snapshot.forEach((doc) => {
          if (!doc.exists()) return;
          result.push({ path: doc.ref.path, data: doc.data() as OrderEntity });
        });
        onValue(result);
      });
    },
    [db],
  );

  /**
   * Fetches recent user orders into the database.
   */
  const fetchCompletedOrder = useCallback(
    async (uid: string, userType: "client" | "driver") => {
      validateOrFail(
        { uid, userType },
        type({
          uid: "string",
          userType: "'client' | 'driver'",
        }),
        "FirestoreError::fetchCurrentActiveOrders",
      );
      const q =
        userType === "driver"
          ? query(
              collection(db, CollectionName.ORDERS),
              where(
                OrderEntityFields.assignedDriverId satisfies keyof OrderEntity,
                "==",
                uid,
              ),
              where(
                OrderEntityFields.status satisfies keyof OrderEntity,
                "==",
                OrderStatus.COMPLETED,
              ),
              limit(20),
            )
          : query(
              collection(db, CollectionName.ORDERS),
              where(
                OrderEntityFields.ownerId satisfies keyof OrderEntity,
                "==",
                uid,
              ),
              where(
                OrderEntityFields.status satisfies keyof OrderEntity,
                "==",
                OrderStatus.COMPLETED,
              ),
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
    updateDriver: updateDriver,
    getDriver,
    fetchCompletedOrder,
    fetchCurrentActiveOrders,
    watchDriver,
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
  const watchPlatformOverview = useCallback(
    (onValue: (arg: EntityWithPath<PlatformOverviewEntity> | null) => void) => {
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

  // const watchPlatformSettings = useCallback(
  //   (onValue: (arg: EntityWithPath<PlatformSettingsEntity> | null) => void) => {
  //     const docRef = doc(db, LATEST_PLATFORM_SETTINGS_PATH);
  //     const unsubscribe = onSnapshot<
  //       PlatformSettingsEntity,
  //       PlatformSettingsEntity
  //     >(
  //       docRef as DocumentReference<
  //         PlatformSettingsEntity,
  //         PlatformSettingsEntity
  //       >,
  //       (snapshot) => {
  //         const res = snapshot.exists()
  //           ? { path: docRef.path, data: snapshot.data() }
  //           : null;
  //         return onValue(res);
  //       },
  //     );
  //     return unsubscribe;
  //   },
  //   [db],
  // );

  const fetchPlatformSettings = useCallback(async () => {
    const docRef = doc(db, LATEST_PLATFORM_SETTINGS_PATH);
    const snapshot = await getDoc<
      PlatformSettingsEntity,
      PlatformSettingsEntity
    >(
      docRef as DocumentReference<
        PlatformSettingsEntity,
        PlatformSettingsEntity
      >,
    );
    return {
      path: docRef.path,
      data: snapshot.exists()
        ? snapshot.data()
        : ({} as PlatformSettingsEntity),
    };
  }, [db]);

  const updatePlatformSettings = useCallback(
    async (settings: Partial<PlatformSettingsEntity>) => {
      const sanitizedSettings = validateOrFail(
        settings,
        platformSettingsEntity.partial(),
        "updatePlatformSettings",
      );
      const docRef = doc(db, LATEST_PLATFORM_SETTINGS_PATH);
      await setDoc<PlatformSettingsEntity, PlatformSettingsEntity>(
        docRef as DocumentReference<
          PlatformSettingsEntity,
          PlatformSettingsEntity
        >,
        { ...sanitizedSettings, updatedAt: serverTimestamp() },
        { merge: true },
      );
    },
    [db],
  );

  return {
    fetchOrders,
    fetchDrivers,
    watchPlatformOverview,
    fetchPayments,
    updatePlatformSettings,
    fetchPlatformSettings,
  };
};

export const useDbOperations = () => {
  const db = useFirestore();

  const { updateOrderStatus } = useOrderDbOperations(db);

  const { insertUser, createUser, getUser } = useUserDbOperations(db);
  const {
    updateDriver: updateDriver,
    getDriver,
    fetchCompletedOrder,
    fetchCurrentActiveOrders,
    watchDriver,
  } = useDriverDbOperations(db);

  const {
    fetchOrders,
    fetchDrivers,
    watchPlatformOverview,
    fetchPayments,
    updatePlatformSettings,
    fetchPlatformSettings,
  } = useAdminDbOperations(db);

  return {
    insertUser,
    createUser,
    fetchCompletedOrder,
    fetchCurrentActiveOrders: fetchCurrentActiveOrders,
    getUser,
    watchDriver,
    updateDriver: updateDriver,
    getDriver,
    updateOrderStatus: updateOrderStatus,
    updatePlatformSettings: updatePlatformSettings,
    fetchOrders,
    fetchDrivers,
    watchPlatformOverview,
    fetchPayments,
    fetchPlatformSettings,
  };
};
