import {
  DriverOrderStatus,
  OrderEntity,
  RequiredVehicleEntity,
} from "@freedmen-s-trucking/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  Dropdown,
  Modal,
  Spinner,
  Tabs,
  Tooltip,
} from "flowbite-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { BsTrainFreightFront } from "react-icons/bs";
import { CiMenuKebab } from "react-icons/ci";
import { GiTruck } from "react-icons/gi";
import {
  HiAdjustments,
  HiClipboardList,
  HiEye,
  HiEyeOff,
  HiLogout,
  HiUserCircle,
  HiViewGrid,
} from "react-icons/hi";
import { IoCarOutline } from "react-icons/io5";
import { PiVanBold } from "react-icons/pi";
import { TbCarSuv, TbLayoutDashboard } from "react-icons/tb";
import { SecondaryButton } from "~/components/atoms/base";
import { DriverProfile } from "~/components/molecules/driver/tab-profile";
import { useAuth } from "~/hooks/use-auth";
import { useDbOperations } from "~/hooks/use-firestore";
import { driverVerificationBadges, tabTheme } from "~/utils/constants";

const tabs = ["overview", "active-orders", "history", "profile"] as const;

const statusMap: Record<
  DriverOrderStatus,
  {
    action: string;
    color: string;
    badge: React.ReactNode;
    nextStatus: DriverOrderStatus | null;
    nextStatusDescription: string;
    nextStatusConfirmation: string;
  }
> = {
  [DriverOrderStatus.WAITING]: {
    action: "Accept Order",
    color: "warning",
    badge: <Badge color="warning">Waiting</Badge>,
    nextStatus: DriverOrderStatus.ACCEPTED,
    nextStatusDescription: "I accept the order",
    nextStatusConfirmation: "You confirm to deliver the order on time.",
  },
  [DriverOrderStatus.ACCEPTED]: {
    action: "On My Way To Pick Up",
    color: "green",
    badge: <Badge color="green">Accepted</Badge>,
    nextStatus: DriverOrderStatus.ON_THE_WAY_TO_PICKUP,
    nextStatusDescription: "Are you on your way to pick up?",
    nextStatusConfirmation:
      "You confirm you're on the way to pick up the package.",
  },
  [DriverOrderStatus.ON_THE_WAY_TO_PICKUP]: {
    action: "On My Way To Deliver",
    color: "blue",
    badge: <Badge color="blue">On The Way To Pick Up</Badge>,
    nextStatus: DriverOrderStatus.ON_THE_WAY_TO_DELIVER,
    nextStatusDescription: "Are you on your way to deliver?",
    nextStatusConfirmation:
      "You confirm you have picked up the package and you're on the way to deliver the package.",
  },
  [DriverOrderStatus.ON_THE_WAY_TO_DELIVER]: {
    action: "Delivered",
    color: "purple",
    badge: <Badge color="purple">On The Way To Deliver</Badge>,
    nextStatus: DriverOrderStatus.DELIVERED,
    nextStatusDescription: "Have you delivered the products?",
    nextStatusConfirmation: "You confirm you have delivered the package.",
  },
  [DriverOrderStatus.DELIVERED]: {
    action: "Delivered",
    color: "success",
    badge: <Badge color="success">Delivered</Badge>,
    nextStatus: null,
    nextStatusDescription: "You have delivered the products",
    nextStatusConfirmation: "",
  },
};

// const getStatusBadge = (status: DriverOrderStatus) => {
//   switch (status) {
//     case DriverOrderStatus.DELIVERED:
//       return <Badge color="success">Delivered</Badge>;
//     case DriverOrderStatus.ACCEPTED:
//       return <Badge color="success">Accepted</Badge>;
//     case DriverOrderStatus.ON_THE_WAY_TO_PICKUP:
//       return <Badge color="indigo">On The Way To Pick Up</Badge>;
//     case DriverOrderStatus.ON_THE_WAY_TO_DELIVER:
//       return <Badge color="info">On The Way To Deliver</Badge>;
//     case DriverOrderStatus.WAITING:
//     default:
//       return <Badge color="warning">Waiting Action</Badge>;
//   }
// };

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
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

const getVerificationBadge = (
  status: keyof typeof driverVerificationBadges,
  iconOnly = false,
) => {
  const badge = driverVerificationBadges[status];

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
  const action = statusMap[order.driverStatus];
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  // Access the client
  const queryClient = useQueryClient();

  const { mutate: moveToNextStatus } = useMutation({
    mutationFn: async () => {
      if (!action.nextStatus) return;
      return updateOrderStatus(user.info.uid, orderPath, action.nextStatus);
    },
    onMutate: () => {
      console.log("Moving to next status for order", orderPath);
      setIsLoading(true);
    },
    onSuccess: () => {
      setIsLoading(false);
      setShowStatusChangeModal(false);
      queryClient.invalidateQueries({ queryKey: ["activeOrders"] });
      queryClient.invalidateQueries({ queryKey: ["historyOrders"] });
      queryClient.invalidateQueries({ queryKey: ["driverInfo"] });
    },
    onError: (error) => {
      console.error("Failed to update order status:", error);
      setIsLoading(false);
      setShowStatusChangeModal(false);
    },
  });

  if (!action) return null;

  return (
    <>
      <Tooltip content={action.nextStatusDescription} placement="top">
        <Button
          color={action.color}
          size="sm"
          className={`disabled:opacity-100 [&>span]:flex [&>span]:flex-row [&>span]:items-center [&>span]:justify-center [&>span]:gap-2`}
          disabled={isLoading || !action.nextStatus}
          onClick={() => setShowStatusChangeModal(true)}
        >
          {isLoading && <Spinner />}
          {action.action}
        </Button>
      </Tooltip>
      <Modal
        size="sm"
        className=" bg-black bg-opacity-70 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
        show={showStatusChangeModal}
        onClose={() => setShowStatusChangeModal(false)}
      >
        <Modal.Header className="[&>button]:rounded-full [&>button]:bg-accent-400 [&>button]:p-[1px] [&>button]:text-primary-100 [&>button]:transition-all  [&>button]:duration-300  hover:[&>button]:scale-110 hover:[&>button]:text-primary-950 ">
          <span className="text-lg font-medium">Confirm Action</span>
        </Modal.Header>
        <Modal.Body className="text-secondary-950">
          <p className="mb-4">{action.nextStatusConfirmation}</p>
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              moveToNextStatus();
            }}
            className="flex flex-col gap-8"
          >
            <SecondaryButton
              type="submit"
              isLoading={isLoading}
              className="self-end border-teal-500 bg-teal-200 py-2 text-secondary-950"
            >
              Confirm
            </SecondaryButton>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

const DriverDashboard = () => {
  const { getDriver, fetchCurrentActiveOrders, fetchCompletedOrder } =
    useDbOperations();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number] | null>(
    "overview",
  );
  const [showDriverId, setShowDriverId] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const logOut = async () => {
    await signOut();
  };

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

  if (!driverInfo) {
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
          <Dropdown
            trigger="hover"
            renderTrigger={() => (
              <span className="inline-block items-center rounded-3xl border border-gray-300 bg-white p-2 text-sm font-medium text-secondary-950 hover:border-primary-700 hover:text-primary-700 focus:border-primary-700 focus:text-primary-700 disabled:pointer-events-none disabled:opacity-50">
                <CiMenuKebab className="h-8 w-8" />
              </span>
            )}
            label=""
          >
            {user.info.isAdmin && (
              <Dropdown.Item
                icon={TbLayoutDashboard}
                onClick={() => navigate({ to: "/app/admin/dashboard" })}
              >
                Admin Dashboard
              </Dropdown.Item>
            )}
            <Dropdown.Item
              icon={TbLayoutDashboard}
              onClick={() => navigate({ to: "/app/customer/dashboard" })}
            >
              Customer Dashboard
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item icon={HiLogout} onClick={logOut}>
              Sign out
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        variant="underline"
        theme={tabTheme}
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
              <h5 className="text-lg font-bold tracking-tight text-secondary-950">
                Current Earnings
              </h5>
              <p className="text-3xl font-bold text-blue-600">
                ${driverInfo.currentEarnings?.toFixed(2) || 0}
              </p>
            </Card>
            <Card>
              <h5 className="text-lg font-bold tracking-tight text-secondary-950">
                Total Earnings
              </h5>
              <p className="text-3xl font-bold text-green-600">
                ${driverInfo.totalEarnings?.toFixed(2) || 0}
              </p>
            </Card>
            <Card>
              <h5 className="text-lg font-bold tracking-tight text-secondary-950">
                Tasks Completed
              </h5>
              <p className="text-3xl font-bold text-purple-600">
                {driverInfo.tasksCompleted}
              </p>
            </Card>
            <Card>
              <h5 className="text-lg font-bold tracking-tight text-secondary-950">
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
                      <h5 className="text-lg font-bold tracking-tight text-secondary-950">
                        {order.data.clientName}
                      </h5>
                      <p className="mb-2 font-normal text-secondary-800 dark:text-gray-400">
                        ORD:{order.path.split("/").pop()?.slice(0, 8)}-****-****
                        <DisplayRequiredVehicles
                          vehicles={order.data.requiredVehicles || []}
                        />
                      </p>
                    </div>
                    <div>{statusMap[order.data.driverStatus].badge}</div>
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
                      ${order.data.priceInUSD.toFixed(2)}
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
                          <p className="truncate text-sm font-medium text-secondary-950">
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
                        <div className="inline-flex items-center text-base font-semibold text-secondary-950">
                          ${order.data.priceInUSD.toFixed(2)}
                        </div>
                        <div>{statusMap[order.data.driverStatus].badge}</div>
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
                    <h5 className="text-lg font-bold tracking-tight text-secondary-950">
                      Order {order.path.split("/").pop()?.slice(0, 13)}-****
                    </h5>
                    <p className="font-normal text-secondary-800 dark:text-gray-400">
                      Client: {order.data.clientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created:{" "}
                      {order.data.createdAt && formatDate(order.data.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="mb-2">
                      {statusMap[order.data.driverStatus].badge}
                    </div>
                    <p className="text-lg font-bold text-secondary-950">
                      ${order.data.priceInUSD.toFixed(2)}
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
                    <p className="text-sm text-secondary-800">
                      {order.data.pickupLocation.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Dropoff Location:</p>
                    <p className="text-sm text-secondary-800">
                      {order.data.deliveryLocation.address}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Accordion collapseAll className="w-full">
                    <Accordion.Panel>
                      <Accordion.Title className="bg-gray-200 p-2 text-secondary-950">
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
                    <h5 className="text-lg font-bold tracking-tight text-secondary-950">
                      Order {order.path.split("/").pop()?.slice(0, 13)}-****
                    </h5>
                    <p className="font-normal text-secondary-800 dark:text-gray-400">
                      Client: {order.data.clientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.data.createdAt && formatDate(order.data.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="mb-2">
                      {statusMap[order.data.driverStatus].badge}
                    </div>
                    <p className="text-lg font-bold text-secondary-950">
                      ${order.data.priceInUSD.toFixed(2)}
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
                    <p className="text-sm text-secondary-800">
                      {order.data.pickupLocation.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Dropoff Location:</p>
                    <p className="text-sm text-secondary-800">
                      {order.data.deliveryLocation.address}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Accordion collapseAll className="w-full">
                    <Accordion.Panel>
                      <Accordion.Title className="bg-gray-200 p-2 text-secondary-950">
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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeVariants}
          >
            <DriverProfile />
          </motion.div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
};

export const Route = createFileRoute("/app/driver/dashboard")({
  beforeLoad({ context }) {
    if (context.user?.driverInfo) {
      return;
    }
    throw redirect({
      to: "/",
    });
  },
  component: DriverDashboard,
});

// function RouteComponent() {
//   return <div>Hello "/app/driver/dashboard"!</div>;
// }
