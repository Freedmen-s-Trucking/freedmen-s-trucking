import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CiMenuKebab } from "react-icons/ci";
import React, { useState } from "react";
import {
  Tabs,
  Badge,
  Button,
  Card,
  Avatar,
  Tooltip,
  Spinner,
  Dropdown,
} from "flowbite-react";
import {
  HiAdjustments,
  HiClipboardList,
  HiEye,
  HiEyeOff,
  HiLogout,
} from "react-icons/hi";
import { useAuth } from "~/hooks/use-auth";
import { useStorageOperations } from "~/hooks/use-storage";
import { useQuery } from "@tanstack/react-query";
import { useDbOperations } from "~/hooks/use-firestore";
import { setUser } from "~/stores/controllers/auth-ctrl";
import { OrderStatus } from "@freedmen-s-trucking/types";
import { useAppDispatch } from "~/stores/hooks";
import { TbLayoutDashboard } from "react-icons/tb";
import { PiPlus } from "react-icons/pi";
import { MdOutlineEdit } from "react-icons/md";
import { CreateOrder } from "~/components/molecules/create-order";
import { tabTheme } from "~/utils/constants";
import { Order } from "~/components/molecules/order-details";

const tabs = ["active-orders", "history"] as const;

const CustomerDashboard = () => {
  const { fetchImage, uploadProfile } = useStorageOperations();
  const { insertUser, fetchCurrentActiveOrders, fetchCompletedOrder } =
    useDbOperations();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number] | null>(
    "active-orders",
  );
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [showCustomerId, setShowCustomerId] = useState(false);
  const { user, signOut } = useAuth();
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const logOut = async () => {
    await signOut();
  };

  const { data: activeOrders, isLoading: activeOrdersLoading } = useQuery({
    initialData: [],
    queryKey: ["activeOrders"],
    queryFn: () => fetchCurrentActiveOrders(user.info.uid, "client"),
    throwOnError(error, query) {
      console.warn({ ref: "activeOrders", error, query });
      return false;
    },
  });
  const { data: historyOrders, isLoading: historyOrdersLoading } = useQuery({
    initialData: [],
    queryKey: ["historyOrders"],
    queryFn: () => fetchCompletedOrder(user.info.uid, "client"),
    throwOnError(error, query) {
      console.warn({ ref: "historyOrders", error, query });
      return false;
    },
  });

  const hasUpdatedOrders = activeOrders.some(
    (order) => order.data.status === OrderStatus.TASKS_ASSIGNED,
  );

  const { data: customerProfileUrl } = useQuery({
    initialData: "",
    enabled: !!user.info.uploadedProfileStoragePath,
    queryKey: ["customerProfileUrl", user.info.uploadedProfileStoragePath],
    queryFn: () => fetchImage(user.info.uploadedProfileStoragePath || ""),
    select(data) {
      return data;
    },
    throwOnError(error, query) {
      console.warn({
        ref: "customerProfileUrl",
        error,
        query,
        user,
        uploadedProfileStoragePath: user.info.uploadedProfileStoragePath,
      });
      return false;
    },
  });

  const handleUploadProfile = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const res = await uploadProfile(user.info.uid, files[0]);
      if (!res) return;
      await insertUser(user.info.uid, { uploadedProfileStoragePath: res });
      dispatch(
        setUser({
          ...user,
          info: {
            ...user.info,
            uploadedProfileStoragePath: res,
          },
        }),
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      {/* Driver Header */}
      <div className="mb-6 flex flex-col items-center rounded-lg bg-white p-4 shadow md:flex-row">
        <div className="relative mb-4 md:mb-0 md:mr-6">
          <Avatar
            placeholderInitials={user.info.displayName}
            img={user.info.photoURL || customerProfileUrl}
            rounded
            size="lg"
          />
          <div className="absolute -right-2 -top-2">
            <label className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-gray-500 p-1">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                multiple={false}
                onChange={handleUploadProfile}
                className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
              />
              <MdOutlineEdit className="h-3 w-3" />
            </label>
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">{user.info.displayName}</h1>
          <p className="text-gray-600">{user.info.email}</p>
          <div className="mt-1 flex items-center justify-center">
            <span className="mr-2">Customer ID:</span>
            {showCustomerId ? (
              <span className="contents font-mono text-sm">
                {user.info.uid}
              </span>
            ) : (
              <span className="contents font-mono text-sm">
                {user.info.uid.slice(0, 4)}-****-****
              </span>
            )}
            <Button
              color="light"
              size="xs"
              className="ml-2 "
              onClick={() => setShowCustomerId(!showCustomerId)}
            >
              {showCustomerId ? (
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
            {user.driverInfo && (
              <Dropdown.Item
                icon={TbLayoutDashboard}
                onClick={() => navigate({ to: "/app/driver/dashboard" })}
              >
                Driver Dashboard
              </Dropdown.Item>
            )}
            <Dropdown.Divider />
            <Dropdown.Item icon={HiLogout} onClick={logOut}>
              Sign out
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        theme={tabTheme}
        variant="underline"
        onActiveTabChange={(tab) => setActiveTab(tabs[tab])}
      >
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
          <div className="mb-4 flex flex-row items-center justify-between">
            <h2 className="text-xl font-bold">Active Orders</h2>

            <Tooltip
              content={"Create new order"}
              className="w-40 bg-secondary-800"
            >
              <button
                onClick={() => setIsCreateOrderModalOpen(true)}
                className="inline-flex items-center rounded-3xl border border-gray-300 bg-white p-2 text-sm font-medium text-secondary-950 hover:border-teal-800 hover:text-teal-800 focus:border-teal-800 focus:text-teal-800 disabled:pointer-events-none disabled:opacity-50"
              >
                <PiPlus className="h-8 w-8" />
              </button>
            </Tooltip>
          </div>
          <div className="mb-8 space-y-4">
            {activeOrdersLoading && (
              <p className="text-xs text-gray-500">Loading active orders...</p>
            )}
            {activeOrders.map((order) => (
              <Order order={order} viewType="customer" key={order.path} />
            ))}

            {activeOrders.length === 0 && (
              <Card>
                <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
                  <p className="text-gray-500">
                    No active orders at the moment.
                  </p>
                  <button
                    onClick={() => setIsCreateOrderModalOpen(true)}
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-primary-800 p-3 text-sm font-medium text-gray-200 hover:border-secondary-800 hover:bg-secondary-800 hover:text-white focus:border-secondary-800 focus:bg-secondary-800 focus:text-white disabled:pointer-events-none disabled:opacity-50"
                  >
                    {historyOrders.length > 0
                      ? "Create New Order"
                      : "Create Your First Order"}
                  </button>
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
          <div className="mb-8 space-y-4">
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
                order={order}
                viewType="customer"
                key={order.path}
                showInModal={false}
              />
            ))}
          </div>
        </Tabs.Item>
      </Tabs>
      {isCreateOrderModalOpen && (
        <CreateOrder
          showInModal
          brightness="light"
          onComplete={() => setIsCreateOrderModalOpen(false)}
        />
      )}
    </div>
  );
};

export const Route = createFileRoute("/app/customer/dashboard")({
  beforeLoad({ context }) {
    if (context.user?.isAnonymous === false) {
      return;
    }
    throw redirect({
      to: "/",
    });
  },
  component: CustomerDashboard,
});
