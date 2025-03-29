import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  Tabs,
  Badge,
  Button,
  Card,
  Avatar,
  Accordion,
  Tooltip,
  Spinner,
} from "flowbite-react";
import {
  HiAdjustments,
  HiClipboardList,
  HiUserCircle,
  HiViewGrid,
  HiEye,
  HiEyeOff,
  HiCheck,
  HiX,
  HiClock,
  HiHome,
} from "react-icons/hi";
import { useAuth } from "@/hooks/use-auth";
import { AppImage } from "@/components/atoms/image";
import { MdHideImage } from "react-icons/md";
import { useStorageOperations } from "@/hooks/use-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDbOperations } from "@/hooks/use-firestore";
import { setUser, updateDriverInfo } from "@/stores/controllers/auth-ctrl";
import {
  DriverEntity,
  OrderEntity,
  DriverOrderStatus,
  RequiredVehicleEntity,
} from "@freedman-trucking/types";
import { useAppDispatch } from "@/stores/hooks";
import { BsTrainFreightFront } from "react-icons/bs";
import { GiTruck } from "react-icons/gi";
import { TbCarSuv } from "react-icons/tb";
import { PiVanBold } from "react-icons/pi";
import { IoCarOutline } from "react-icons/io5";

const tabs = ["overview", "active-orders", "history", "profile"] as const;

const getStatusBadge = (status: DriverOrderStatus) => {
  switch (status) {
    case "delivered":
      return <Badge color="success">Delivered</Badge>;
    case "picked-up":
      return <Badge color="indigo">Picked Up</Badge>;
    case "on-the-way":
      return <Badge color="info">On The Way</Badge>;
    case "waiting":
    default:
      return <Badge color="warning">Waiting Action</Badge>;
  }
};

const DisplayRequiredVehicles: React.FC<{
  vehicles: RequiredVehicleEntity[] | undefined;
}> = ({ vehicles }) => {
  const vehicleIcons: Record<RequiredVehicleEntity["type"], React.ReactNode> = {
    SEDAN: <IoCarOutline />,
    SUV: <TbCarSuv />,
    VAN: <PiVanBold />,
    TRUCK: <GiTruck />,
    FREIGHT: <BsTrainFreightFront />,
  };
  return (
    <>
      {(vehicles || []).map((vehicle) => (
        <span key={vehicle.type}>
          {vehicle.quantity} * {vehicleIcons[vehicle.type]}
        </span>
      ))}
    </>
  );
};
const verificationBadges = {
  verified: {
    color: "success",
    icon: HiCheck,
    label: "Verified",
  },
  failed: {
    color: "failure",
    icon: HiX,
    label: "Verification Failed",
  },
  pending: {
    color: "warning",
    icon: HiClock,
    label: "Verification Pending",
  },
};
const getVerificationBadge = (
  status: keyof typeof verificationBadges,
  iconOnly = false,
) => {
  const badge = verificationBadges[status];

  return (
    <Tooltip content={badge.label} placement="top">
      <Badge color={badge.color} icon={badge.icon}>
        {!iconOnly && badge.label}
      </Badge>
    </Tooltip>
  );
};
const GetNextActionButton: React.FC<{
  orderPath: string;
  order: OrderEntity;
}> = ({ orderPath, order }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { updateOrderStatus } = useDbOperations();
  const statusMap: Record<
    DriverOrderStatus,
    {
      text: string;
      color: string;
      nextStatus: DriverOrderStatus | null;
      nextStatusDescription: string;
    }
  > = {
    [DriverOrderStatus.WAITING]: {
      text: "Accept Order",
      color: "green",
      nextStatus: DriverOrderStatus.PICKED_UP,
      nextStatusDescription: "On my way to pick up the products",
    },
    [DriverOrderStatus.PICKED_UP]: {
      text: "On My Way",
      color: "blue",
      nextStatus: DriverOrderStatus.ON_THE_WAY,
      nextStatusDescription:
        "I have picked up the products and am on my way to the delivery location",
    },
    [DriverOrderStatus.ON_THE_WAY]: {
      text: "Delivered",
      color: "purple",
      nextStatus: DriverOrderStatus.DELIVERED,
      nextStatusDescription: "I have delivered the products",
    },
    [DriverOrderStatus.DELIVERED]: {
      text: "Delivered",
      color: "success",
      nextStatus: null,
      nextStatusDescription: "You have delivered the products",
    },
  };

  const action = statusMap[order.driverStatus];
  // Access the client
  const queryClient = useQueryClient();

  const { mutate: moveToNextStatus } = useMutation({
    mutationFn: async (orderPath: string) => {
      if (!action.nextStatus) return;
      return updateOrderStatus(user.info.uid, orderPath, action.nextStatus);
    },
    onMutate: (orderPath: string) => {
      console.log("Moving to next status for order", orderPath);
      setIsLoading(true);
    },
    onSuccess: () => {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      queryClient.invalidateQueries({ queryKey: ["historyOrders"] });
      queryClient.invalidateQueries({ queryKey: ["driverInfo"] });
    },
    onError: (error) => {
      console.error("Failed to update order status:", error);
      setIsLoading(false);
    },
  });

  if (!action) return null;

  return (
    <Tooltip content={action.nextStatusDescription} placement="top">
      <Button
        color={action.color}
        size="sm"
        className={`disabled:opacity-100 [&>span]:flex [&>span]:flex-row [&>span]:items-center [&>span]:justify-center [&>span]:gap-2`}
        disabled={isLoading || !action.nextStatus}
        onClick={() => moveToNextStatus(orderPath)}
      >
        {isLoading && <Spinner />}
        {action.text}
      </Button>
    </Tooltip>
  );
};

const DriverDashboard = () => {
  const { fetchImage, uploadCertificate } = useStorageOperations();
  const {
    updateDriver: _updateDriver,
    getDriver,
    fetchCurrentActiveOrders,
    fetchCompletedOrder,
  } = useDbOperations();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number] | null>(
    "overview",
  );
  const [showDriverId, setShowDriverId] = useState(false);
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const { data: driverInfo } = useQuery({
    initialData: user.driverInfo,
    queryKey: ["driverInfo"],
    queryFn: () => {
      return getDriver(user.info.uid);
    },
    throwOnError(error, query) {
      console.warn({ ref: "driverInfo", error, query });
      return false;
    },
  });

  const { data: activeOrders, isLoading: activeOrdersLoading } = useQuery({
    initialData: [],
    queryKey: ["activeOrders"],
    queryFn: () => fetchCurrentActiveOrders(user.info.uid, "driver"),
    throwOnError(error, query) {
      console.warn({ ref: "activeOrders", error, query });
      return false;
    },
  });
  const { data: historyOrders, isLoading: historyOrdersLoading } = useQuery({
    initialData: [],
    queryKey: ["historyOrders"],
    queryFn: () => fetchCompletedOrder(user.info.uid, "driver"),
    throwOnError(error, query) {
      console.warn({ ref: "historyOrders", error, query });
      return false;
    },
  });

  const { mutate: updateDriver } = useMutation({
    mutationFn: async (driverInfo: Partial<DriverEntity>) => {
      return _updateDriver(user.info.uid, driverInfo);
    },
    onSuccess(_, variables) {
      dispatch(updateDriverInfo(variables));
      queryClient.invalidateQueries({ queryKey: ["driverInfo"] });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const hasUpdatedOrders = activeOrders.some(
    (order) => order.data.driverStatus === DriverOrderStatus.WAITING,
  );

  const navigation = useNavigate();
  const { data: driverLicenseUrl } = useQuery({
    initialData: "",
    queryKey: ["driverLicenseUrl", driverInfo?.driverLicense?.storagePath],
    queryFn: () => fetchImage(driverInfo?.driverLicense?.storagePath || ""),
    select(data) {
      return data;
    },
    throwOnError(error, query) {
      console.warn({ ref: "driverLicenseUrl", error, query });
      return false;
    },
  });
  const { data: driverInsuranceUrl } = useQuery({
    initialData: "",
    queryKey: ["driverInsuranceUrl", driverInfo?.driverInsurance?.storagePath],
    queryFn: () => fetchImage(driverInfo?.driverInsurance?.storagePath || ""),
    select(data) {
      return data;
    },
    throwOnError(error, query) {
      console.warn({ ref: "driverInsuranceUrl", error, query });
      return false;
    },
  });

  const handleUploadLicense = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const res = await uploadCertificate(
        user.info.uid,
        files[0],
        "driver-license",
      );
      if (!res) return;
      await updateDriver({
        driverLicense: {
          storagePath: res,
          status: "pending",
          expiry: "",
          issues: [],
        },
      });
      dispatch(
        setUser({
          ...user,
          driverInfo: {
            ...(user.driverInfo || ({} as DriverEntity)),
            driverLicense: {
              storagePath: res,
              status: "pending",
              expiry: "",
              issues: [],
            },
          },
        }),
      );
    }
  };

  const handleUploadInsurance = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const res = await uploadCertificate(
        user.info.uid,
        files[0],
        "driver-insurance",
      );
      if (!res) return;
      await updateDriver({
        driverInsurance: {
          storagePath: res,
          status: "pending",
          expiry: "",
          issues: [],
        },
      });
      dispatch(
        setUser({
          ...user,
          driverInfo: {
            ...(user.driverInfo || ({} as DriverEntity)),
            driverInsurance: {
              storagePath: res,
              status: "pending",
              expiry: "",
              issues: [],
            },
          },
        }),
      );
    }
  };

  if (!driverInfo) {
    navigation({ to: "/" });
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Driver Header */}
      <div className="mb-6 flex flex-col items-center rounded-lg bg-white p-4 shadow md:flex-row">
        <div className="relative mb-4 md:mb-0 md:mr-6">
          <Avatar
            placeholderInitials={user.info.displayName}
            img={user.info.photoURL || ""}
            rounded
            size="lg"
          />
          <div className="absolute -right-2 -top-2">
            {getVerificationBadge(driverInfo.verificationStatus, true)}
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">{user.info.displayName}</h1>
          <p className="text-gray-600">{user.info.email}</p>
          <div className="mt-1 flex items-center">
            <span className="mr-2">Driver ID:</span>
            {showDriverId ? (
              <span className="font-mono">{user.info.uid}</span>
            ) : (
              <span className="font-mono">
                {user.info.uid.slice(0, 4)}-****-****
              </span>
            )}
            <Button
              color="light"
              size="xs"
              className="ml-2"
              onClick={() => setShowDriverId(!showDriverId)}
            >
              {showDriverId ? (
                <HiEyeOff className="h-4 w-4" />
              ) : (
                <HiEye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-end justify-end md:flex-row">
          <Tooltip content={"Return to home"} className="w-36">
            <Link
              to="/"
              className="inline-flex items-center rounded-3xl border border-gray-300 bg-white p-2 text-sm font-medium text-gray-900 hover:border-red-400 hover:text-red-400 focus:border-red-400 focus:text-red-400 disabled:pointer-events-none disabled:opacity-50"
            >
              <HiHome className="h-8 w-8" />
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        variant="underline"
        onActiveTabChange={(tab) => setActiveTab(tabs[tab])}
        className="focus:[&>button]:outline-none focus:[&>button]:ring-0"
      >
        <Tabs.Item
          active={activeTab === "overview"}
          title="Overview"
          icon={HiViewGrid}
        >
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <h5 className="text-lg font-bold tracking-tight text-gray-900">
                Current Earnings
              </h5>
              <p className="text-3xl font-bold text-blue-600">
                ${driverInfo.currentEarnings?.toFixed(2) || 0}
              </p>
            </Card>
            <Card>
              <h5 className="text-lg font-bold tracking-tight text-gray-900">
                Total Earnings
              </h5>
              <p className="text-3xl font-bold text-green-600">
                ${driverInfo.totalEarnings?.toFixed(2) || 0}
              </p>
            </Card>
            <Card>
              <h5 className="text-lg font-bold tracking-tight text-gray-900">
                Tasks Completed
              </h5>
              <p className="text-3xl font-bold text-purple-600">
                {driverInfo.tasksCompleted}
              </p>
            </Card>
            <Card>
              <h5 className="text-lg font-bold tracking-tight text-gray-900">
                Active Tasks
              </h5>
              <p className="text-3xl font-bold text-orange-600">
                {driverInfo.activeTasks}
              </p>
            </Card>
          </div>

          {/* Active Orders */}
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-bold">Current Active Orders</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activeOrdersLoading && (
                <p className="text-xs text-gray-500">
                  Loading active orders...
                </p>
              )}
              {activeOrders.length === 0 && (
                <Card>
                  <div className="py-4 text-center">
                    <p className="text-gray-500">
                      No active orders at the moment.
                    </p>
                  </div>
                </Card>
              )}
              {activeOrders.slice(0, 2).map((order) => (
                <Card
                  key={order.path}
                  className={
                    order.data.updatedAt ? "border-l-4 border-blue-500" : ""
                  }
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-lg font-bold tracking-tight text-gray-900">
                        {order.data.clientName}
                      </h5>
                      <p className="mb-2 font-normal text-gray-700 dark:text-gray-400">
                        ORD:{order.path.split("/").pop()?.slice(0, 8)}-****-****
                        <DisplayRequiredVehicles
                          vehicles={order.data.requiredVehicles || []}
                        />
                      </p>
                    </div>
                    <div>{getStatusBadge(order.data.driverStatus)}</div>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <strong>Pickup:</strong>{" "}
                      {order.data.pickupLocation.address}
                    </p>
                    <p>
                      <strong>Dropoff:</strong>{" "}
                      {order.data.deliveryLocation.address}
                    </p>
                    <p className="mt-2 text-lg font-bold">
                      ${order.data.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <GetNextActionButton
                      orderPath={order.path}
                      order={order.data}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent History */}
          <div>
            <h2 className="mb-3 text-xl font-bold">Recent History</h2>
            <Card>
              <div className="flow-root">
                <ul className="divide-y divide-gray-200">
                  {historyOrdersLoading && (
                    <div className="flex items-center justify-center">
                      <Spinner size="md" light={false} />
                      <p className="ml-2 text-xs text-gray-500">Loading...</p>
                    </div>
                  )}
                  {historyOrders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-4">
                      <p className="text-xs text-gray-500">
                        No order history found.
                      </p>
                    </div>
                  )}

                  {historyOrders.slice(0, 5).map((order) => (
                    <li key={order.path} className="py-3 sm:py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {order.data.clientName}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {order.path}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.data.createdAt &&
                              formatDate(order.data.createdAt)}
                          </p>
                        </div>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                          ${order.data.price.toFixed(2)}
                        </div>
                        <div>{getStatusBadge(order.data.driverStatus)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </Tabs.Item>

        <Tabs.Item
          active={activeTab === "active-orders"}
          title={
            <div className="flex items-center">
              <span>Active Orders</span>
              {hasUpdatedOrders && (
                <Badge color="info" className="ml-2">
                  New
                </Badge>
              )}
            </div>
          }
          icon={HiAdjustments}
        >
          <h2 className="mb-4 text-xl font-bold">Active Orders</h2>
          <div className="space-y-4">
            {activeOrdersLoading && (
              <p className="text-xs text-gray-500">Loading active orders...</p>
            )}
            {activeOrders.map((order) => (
              <Card
                key={order.path}
                className={
                  order.data.driverStatus === DriverOrderStatus.WAITING
                    ? "border-l-4 border-blue-500"
                    : ""
                }
              >
                <div className="flex flex-col justify-between md:flex-row">
                  <div className="mb-3 md:mb-0">
                    <h5 className="text-lg font-bold tracking-tight text-gray-900">
                      Order {order.path.split("/").pop()?.slice(0, 13)}-****
                    </h5>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Client: {order.data.clientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created:{" "}
                      {order.data.createdAt && formatDate(order.data.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="mb-2">
                      {getStatusBadge(order.data.driverStatus)}
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      ${order.data.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <DisplayRequiredVehicles
                        vehicles={order.data.requiredVehicles || []}
                      />
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold">Pickup Location:</p>
                    <p className="text-sm text-gray-700">
                      {order.data.pickupLocation.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Dropoff Location:</p>
                    <p className="text-sm text-gray-700">
                      {order.data.deliveryLocation.address}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Accordion collapseAll className="w-full">
                    <Accordion.Panel>
                      <Accordion.Title className="bg-gray-200 p-2 text-gray-900">
                        View Map
                      </Accordion.Title>
                      <Accordion.Content>
                        <div className="flex h-64 items-center justify-center bg-gray-200 text-gray-500">
                          <p>Map with route would appear here</p>
                        </div>
                      </Accordion.Content>
                    </Accordion.Panel>
                  </Accordion>
                </div>

                <div className="mt-3 flex justify-end">
                  <GetNextActionButton
                    orderPath={order.path}
                    order={order.data}
                  />
                </div>
              </Card>
            ))}

            {activeOrders.length === 0 && (
              <Card>
                <div className="py-4 text-center">
                  <p className="text-gray-500">
                    No active orders at the moment.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </Tabs.Item>

        <Tabs.Item
          active={activeTab === "history"}
          title="History"
          icon={HiClipboardList}
        >
          <h2 className="mb-4 text-xl font-bold">Order History</h2>
          <div className="space-y-4">
            {historyOrdersLoading && (
              <div className="flex items-center justify-center">
                <Spinner size="md" light={false} />
                <p className="ml-2 text-xs text-gray-500">Loading...</p>
              </div>
            )}
            {historyOrders.length === 0 && (
              <Card>
                <div className="flex flex-col items-center justify-center py-4">
                  <p className="text-gray-500">
                    No order history at the moment
                  </p>
                  <p className="text-gray-500">
                    As you complete orders, you will see them appear here.
                  </p>
                </div>
              </Card>
            )}
            {historyOrders.map((order) => (
              <Card key={order.path}>
                <div className="flex flex-col justify-between md:flex-row">
                  <div className="mb-3 md:mb-0">
                    <h5 className="text-lg font-bold tracking-tight text-gray-900">
                      Order {order.path.split("/").pop()?.slice(0, 13)}-****
                    </h5>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Client: {order.data.clientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.data.createdAt && formatDate(order.data.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="mb-2">
                      {getStatusBadge(order.data.driverStatus)}
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      ${order.data.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <DisplayRequiredVehicles
                        vehicles={order.data.requiredVehicles}
                      />
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold">Pickup Location:</p>
                    <p className="text-sm text-gray-700">
                      {order.data.pickupLocation.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Dropoff Location:</p>
                    <p className="text-sm text-gray-700">
                      {order.data.deliveryLocation.address}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Accordion collapseAll className="w-full">
                    <Accordion.Panel>
                      <Accordion.Title className="bg-gray-200 p-2 text-gray-900">
                        View Map
                      </Accordion.Title>
                      <Accordion.Content>
                        <div className="flex h-64 items-center justify-center bg-gray-200 text-gray-500">
                          <p>Map with route would appear here</p>
                        </div>
                      </Accordion.Content>
                    </Accordion.Panel>
                  </Accordion>
                </div>
              </Card>
            ))}
          </div>
        </Tabs.Item>

        <Tabs.Item
          active={activeTab === "profile"}
          title="Profile"
          icon={HiUserCircle}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h5 className="mb-4 text-xl font-bold">Personal Information</h5>
              <div className="mb-6 flex flex-col sm:flex-row">
                <div className="mb-4 sm:mb-0 sm:mr-6">
                  <Avatar
                    placeholderInitials={user.info.displayName}
                    img={user.info.photoURL || ""}
                    size="xl"
                    rounded
                  />
                  {/* <Button size="xs" className="mt-2 w-full">
                    Change Photo
                  </Button> */}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={user.info.displayName}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={user.info.email || ""}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Driver License Information */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h5 className="mb-3 text-lg font-bold">
                  Driver License Information
                </h5>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <AppImage
                      fallback={<MdHideImage className="h-8 w-8" />}
                      src={driverLicenseUrl}
                      alt="driver license"
                      className="h-auto w-1/2 max-w-96 rounded-md"
                    />
                    {/* <div>
                      <p>
                        <strong>License Number:</strong>{" "}
                        {driverInfo.driverLicense.number}
                      </p>
                      <p>
                        <strong>Expiry Date:</strong>{" "}
                        {driverInfo.driverLicense.expiry}
                      </p>
                    </div> */}
                    <div>
                      {getVerificationBadge(driverInfo.driverLicense.status)}
                    </div>
                  </div>

                  {driverInfo.driverLicense.status === "failed" && (
                    <div className="mt-3 border-l-4 border-red-400 bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Verification Issues
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <ul className="list-disc space-y-1 pl-5">
                              {driverInfo.driverLicense.issues.map(
                                (issue, index) => (
                                  <li key={index}>{issue}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between">
                    {driverInfo.driverLicense.status !== "verified" && (
                      <>
                        <label className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-500">
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.webp"
                            multiple={false}
                            required
                            onChange={handleUploadLicense}
                            className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
                          />
                          <Button color="light" className="pointer-events-none">
                            Upload New License
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h5 className="mb-3 text-lg font-bold">
                  Insurance Information
                </h5>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <AppImage
                      fallback={<MdHideImage className="h-8 w-8" />}
                      src={driverInsuranceUrl}
                      alt="driver license"
                      className="h-auto w-1/2 max-w-96 rounded-md"
                    />
                    <div>
                      {getVerificationBadge(driverInfo.driverInsurance.status)}
                    </div>
                  </div>

                  {driverInfo.driverInsurance.status === "failed" && (
                    <div className="mt-3 border-l-4 border-red-400 bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Verification Issues
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <ul className="list-disc space-y-1 pl-5">
                              {driverInfo.driverInsurance.issues.map(
                                (issue, index) => (
                                  <li key={index}>{issue}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between">
                    {driverInfo.driverInsurance.status !== "verified" && (
                      <label className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-500">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          multiple={false}
                          required
                          onChange={handleUploadInsurance}
                          className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
                        />
                        <Button color="light" className="pointer-events-none">
                          Upload New Insurance
                        </Button>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-6">
              <Card>
                <h5 className="mb-4 text-xl font-bold">Payment Methods</h5>
                {driverInfo.paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="mb-3 flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{method.type}</p>
                      <p className="text-sm text-gray-600">{method.details}</p>
                    </div>
                    <div className="flex items-center">
                      {method.default && (
                        <Badge color="success" className="mr-2">
                          Default
                        </Badge>
                      )}
                      <Button size="xs" color="light">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                <Button disabled color="dark">
                  Add Payment Method
                </Button>
              </Card>

              {/* Withdrawals */}
              <Card>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h5 className="text-xl font-bold">Withdrawals</h5>
                  <Button disabled color="dark" size="xs">
                    Request Withdrawal
                  </Button>
                </div>
                <div className="space-y-3">
                  <p className="font-medium">Available for withdrawal:</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${driverInfo.currentEarnings?.toFixed(2) || 0}
                  </p>
                </div>
                <div className="mt-4">
                  <h6 className="mb-2 font-medium">Recent Withdrawals</h6>
                  <div className="flow-root">
                    <ul className="divide-y divide-gray-200">
                      {driverInfo.withdrawalHistory.length === 0 && (
                        <li className="py-3">
                          <p className="text-xs font-medium">
                            No withdrawals yet
                          </p>
                        </li>
                      )}
                      {driverInfo.withdrawalHistory.map((withdrawal) => (
                        <li key={withdrawal.id} className="py-3">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {withdrawal.id}
                              </p>
                              <p className="text-xs text-gray-500">
                                {withdrawal.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">
                                ${withdrawal.amount.toFixed(2)}
                              </p>
                              <Badge color="success" className="mt-1">
                                {withdrawal.status}
                              </Badge>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
};

export const Route = createFileRoute("/app/driver/dashboard")({
  component: DriverDashboard,
});

// function RouteComponent() {
//   return <div>Hello "/app/driver/dashboard"!</div>;
// }
