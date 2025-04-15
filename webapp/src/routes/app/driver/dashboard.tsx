import { DriverOrderStatus } from "@freedmen-s-trucking/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dropdown,
  Spinner,
  Tabs,
  Tooltip,
} from "flowbite-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import {
  HiAdjustments,
  HiClipboardList,
  HiEye,
  HiEyeOff,
  HiLogout,
  HiUserCircle,
  HiViewGrid,
} from "react-icons/hi";
import { TbLayoutDashboard } from "react-icons/tb";
import { DriverProfile } from "~/components/molecules/driver/tab-profile";
import { Order } from "~/components/molecules/order-details";
import { useAuth } from "~/hooks/use-auth";
import { useDbOperations } from "~/hooks/use-firestore";
import { driverVerificationBadges, tabTheme } from "~/utils/constants";
import {
  customDateFormat,
  getDriverVerificationStatus,
} from "~/utils/functions";

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

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
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

  const hasUpdatedOrders = activeOrders.some(
    (order) =>
      order.data[`task-${user.info.uid}`]?.driverStatus ===
      DriverOrderStatus.WAITING,
  );

  if (!driverInfo) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
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
            {getVerificationBadge(
              getDriverVerificationStatus(driverInfo),
              true,
            )}
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
                {driverInfo.tasksCompleted || 0}
              </p>
            </Card>
            <Card>
              <h5 className="text-lg font-bold tracking-tight text-secondary-950">
                Active Tasks
              </h5>
              <p className="text-3xl font-bold text-orange-600">
                {driverInfo.activeTasks || 0}
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
                <Order order={order} viewType="driver" key={order.path} />
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
                              customDateFormat(order.data.createdAt)}
                          </p>
                        </div>
                        <div className="inline-flex items-center text-base font-semibold text-secondary-950">
                          ${order.data.priceInUSD.toFixed(2)}
                        </div>
                        <div>
                          {
                            statusMap[
                              order.data[`task-${user.info.uid}`]
                                ?.driverStatus || DriverOrderStatus.WAITING
                            ].badge
                          }
                        </div>
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
          <div className="mb-8 space-y-4">
            {activeOrdersLoading && (
              <p className="text-xs text-gray-500">Loading active orders...</p>
            )}
            {activeOrders.map((order) => (
              <Order.Details
                key={order.path}
                showInModal={false}
                order={order}
                viewType="driver"
              />
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
              <Order.Details
                key={order.path}
                showInModal={false}
                order={order}
                viewType="driver"
              />
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
