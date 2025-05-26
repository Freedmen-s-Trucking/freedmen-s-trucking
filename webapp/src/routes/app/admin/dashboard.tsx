import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Tabs, Badge } from "flowbite-react";
import {
  MdDashboard,
  MdDirectionsCar,
  MdShoppingCart,
  MdPayment,
  MdSettings,
} from "react-icons/md";
import { motion } from "framer-motion";

// Import components
import AdminHeader from "~/components/molecules/admin/admin-header";
import Overview from "~/components/molecules/admin/tab-overview";
import Drivers from "~/components/molecules/admin/tab-drivers";
import Orders from "~/components/molecules/admin/tab-orders";
import Transactions from "~/components/molecules/admin/tab-transactions";
import PlatformSettings from "~/components/molecules/admin/tab-settings";
import { useDbOperations } from "~/hooks/use-firestore";
import {
  EntityWithPath,
  PlatformOverviewEntity,
} from "@freedmen-s-trucking/types";
import { tabTheme } from "~/utils/constants";

// Mock API functions (replace with your actual API calls)
const AdminDashboard: React.FC = () => {
  const route = useRouterState();
  const routeParams = new URLSearchParams(
    decodeURIComponent(route.location.hash),
  );
  const activeTab = routeParams.get("tab") || "overview";

  const { watchPlatformOverview } = useDbOperations();
  const [overview, setData] =
    useState<EntityWithPath<PlatformOverviewEntity> | null>(null);

  const navigation = useNavigate();
  const parentTabRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const unsubscribe = watchPlatformOverview((arg) =>
      setData(
        arg ||
          ({ data: {}, path: "" } as EntityWithPath<PlatformOverviewEntity>),
      ),
    );

    return () => unsubscribe();
  }, [watchPlatformOverview]);

  useEffect(() => {
    if (parentTabRef.current) {
      parentTabRef.current
        .querySelector('[role="tablist"]')
        ?.querySelector('[aria-selected="true"]')
        ?.scrollIntoView({ behavior: "instant", block: "center" });
    }
  }, [parentTabRef]);

  const onActiveTabChange = (tabindex: number) => {
    switch (tabindex) {
      case 0:
        routeParams.set("tab", "overview");
        break;
      case 1:
        routeParams.set("tab", "driverManagement");
        break;
      case 2:
        routeParams.set("tab", "ordersGroups");
        break;
      case 3:
        routeParams.set("tab", "transactions");
        break;
      case 4:
        routeParams.set("tab", "settings");
        break;
    }
    navigation({
      to: route.location.pathname,
      hash: routeParams.toString(),
      replace: true,
    });
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-2">
      <AdminHeader />

      <div ref={parentTabRef} className="w-full max-w-5xl py-6">
        <Tabs
          theme={tabTheme}
          aria-label="Admin Dashboard Tabs"
          variant="underline"
          className="[&>div]:scrollbar-hide mb-4 [&>div]:flex-row [&>div]:flex-nowrap [&>div]:overflow-x-auto"
          onActiveTabChange={onActiveTabChange}
        >
          <Tabs.Item
            className="inline"
            title={
              <div className="flex items-center gap-2">
                <MdDashboard className="h-5 w-5" />
                <span>Overview</span>
              </div>
            }
            active={activeTab === "overview"}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeVariants}
            >
              <Overview overview={overview} />
            </motion.div>
          </Tabs.Item>

          <Tabs.Item
            title={
              <div className="flex items-center gap-2">
                <MdDirectionsCar className="h-5 w-5" />
                <span>Driver Management</span>
                {(overview?.data.totalPendingVerificationDrivers && (
                  <Badge
                    color="warning"
                    className="ml-2 rounded-full bg-accent-300 text-primary-50"
                  >
                    {overview?.data.totalPendingVerificationDrivers}
                  </Badge>
                )) ||
                  null}
              </div>
            }
            active={activeTab === "driverManagement"}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeVariants}
            >
              <Drivers />
            </motion.div>
          </Tabs.Item>

          <Tabs.Item
            title={
              <div className="flex items-center gap-2">
                <MdShoppingCart className="h-5 w-5" />
                <span>Orders Groups</span>
              </div>
            }
            active={activeTab === "ordersGroups"}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeVariants}
            >
              <Orders />
            </motion.div>
          </Tabs.Item>

          <Tabs.Item
            title={
              <div className="flex items-center gap-2">
                <MdPayment className="h-5 w-5" />
                <span>Transactions</span>
              </div>
            }
            active={activeTab === "transactions"}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeVariants}
            >
              <Transactions />
            </motion.div>
          </Tabs.Item>

          <Tabs.Item
            title={
              <div className="flex items-center gap-2">
                <MdSettings className="h-5 w-5" />
                <span>Settings</span>
              </div>
            }
            active={activeTab === "settings"}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeVariants}
            >
              <PlatformSettings />
            </motion.div>
          </Tabs.Item>

          {/* <Tabs.Item
            title={
              <div className="flex items-center gap-2">
                <MdPeople className="h-5 w-5" />
                <span>Users</span>
              </div>
            }
            active={activeTab === "users"}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeVariants}
            >
              <Users data={usersData} />
            </motion.div>
          </Tabs.Item>

          <Tabs.Item
            title={
              <div className="flex items-center gap-2">
                <MdList className="h-5 w-5" />
                <span>Waitlist</span>
                {updatedWaitlistCount && (
                  <Badge color="info" className="ml-2">
                    Updated
                  </Badge>
                )}
              </div>
            }
            active={activeTab === "waitlist"}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeVariants}
            >
              <Waitlist data={waitlistData} />
            </motion.div>
          </Tabs.Item> */}
        </Tabs>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/app/admin/dashboard")({
  beforeLoad({ context }) {
    if (!context.user?.info?.isAdmin) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: AdminDashboard,
});
