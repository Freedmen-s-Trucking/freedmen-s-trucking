import { useContext, useMemo } from "react";
import { FireStoreCtx } from "~/provider/firestore";
import {
  collection,
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
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
  TaskGroupEntity,
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

const orderDbOperations = (db: Firestore) => {
  /**
   * Update order.
   */
  const updateOrderStatus = async (params: {
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
  };

  return { updateOrderStatus: updateOrderStatus };
};

const userDbOperations = (db: Firestore) => {
  /**
   * Create user if he doesn't exist.
   */
  const createUser = async (user: UserEntity) => {
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
  };

  /**
   * Inserts user into the database.
   */
  const insertUser = async (uid: string, user: Partial<UserEntity>) => {
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
  };

  /**
   * Get user from the database.
   */
  const getUser = async (uid: string) => {
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
  };

  return { insertUser, createUser, getUser };
};

const driverDbOperations = (db: Firestore) => {
  /**
   * Updates driver in the database.
   */
  const updateDriver = async (
    uid: string,
    driver: PartialWithFieldValue<DriverEntity>,
  ) => {
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
  };

  const getDriver = async (uid: string) => {
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
  };

  const watchDriver = (
    uid: string,
    onValue: (driver: DriverEntity | null) => void,
  ) => {
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
  };

  /**
   * Fetches active orders user orders into the database.
   */
  const fetchCurrentActiveOrders = (
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
  };

  /**
   * Fetches recent user orders into the database.
   */
  const fetchCompletedOrder = async (
    uid: string,
    userType: "client" | "driver",
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
  };

  return {
    updateDriver: updateDriver,
    getDriver,
    fetchCompletedOrder,
    fetchCurrentActiveOrders,
    watchDriver,
  };
};

const adminDbOperations = (db: Firestore) => {
  /**
   * Fetches orders from the database.
   */
  const fetchOrders = async () => {
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
  };

  /**
   * Fetches task groups from the database.
   */
  const fetchTaskGroups = async () => {
    const q = query(collection(db, CollectionName.TASK_GROUPS));
    const res = await getDocs<TaskGroupEntity, TaskGroupEntity>(
      q as Query<TaskGroupEntity, TaskGroupEntity>,
    );
    const result = <{ path: string; data: TaskGroupEntity }[]>[];

    res.forEach((doc) => {
      if (!doc.exists()) return;
      result.push({ path: doc.ref.path, data: doc.data() });
    });
    return result;
  };

  /**
   * Fetches drivers from the database.
   * Note: Firebase security rules is the one responsible to grant access to the data, not client code.
   */
  const fetchDrivers = async () => {
    const q = query(collection(db, CollectionName.DRIVERS));
    const driversQuerySnapshot = await getDocs<DriverEntity, DriverEntity>(
      q as Query<DriverEntity, DriverEntity>,
    );
    const result = <{ path: string; data: DriverEntity }[]>[];

    for (const snapshot of driversQuerySnapshot.docs) {
      if (!snapshot.exists()) continue;
      result.push({
        path: snapshot.ref.path,
        data: { ...snapshot.data() },
      });
    }

    return result;
  };

  /**
   * Fetches the overview of the platform.
   * Note: Firebase security rules is the one responsible to grant access to the data, not client code.
   */
  const watchPlatformOverview = (
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
  };

  const fetchPayments = async () => {
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
  };

  // const watchPlatformSettings =
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
  //
  // );

  const fetchPlatformSettings = async () => {
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
  };

  const updatePlatformSettings = async (
    settings: Partial<PlatformSettingsEntity>,
  ) => {
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
  };

  return {
    fetchOrders,
    fetchTaskGroups,
    fetchDrivers,
    watchPlatformOverview,
    fetchPayments,
    updatePlatformSettings,
    fetchPlatformSettings,
  };
};

export const useDbOperations = () => {
  const db = useFirestore();

  const { updateOrderStatus } = useMemo(() => orderDbOperations(db), [db]);

  const { insertUser, createUser, getUser } = useMemo(
    () => userDbOperations(db),
    [db],
  );
  const {
    updateDriver: updateDriver,
    getDriver,
    fetchCompletedOrder,
    fetchCurrentActiveOrders,
    watchDriver,
  } = useMemo(() => driverDbOperations(db), [db]);

  const {
    fetchOrders,
    fetchTaskGroups,
    fetchDrivers,
    watchPlatformOverview,
    fetchPayments,
    updatePlatformSettings,
    fetchPlatformSettings,
  } = useMemo(() => adminDbOperations(db), [db]);

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
    fetchTaskGroups,
    fetchDrivers,
    watchPlatformOverview,
    fetchPayments,
    fetchPlatformSettings,
  };
};
