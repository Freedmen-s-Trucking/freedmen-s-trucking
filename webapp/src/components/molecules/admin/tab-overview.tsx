import { Card, Spinner } from "flowbite-react";
import {
  HiCurrencyDollar,
  HiShoppingCart,
  HiClock,
  HiCheck,
  HiX,
} from "react-icons/hi";
import { motion } from "framer-motion";
import {
  EntityWithPath,
  PlatformOverviewEntity,
} from "@freedmen-s-trucking/types";
import { customDateFormat } from "~/utils/functions";

const StatCard: React.FC<{
  title: string;
  value: string | null;
  icon: React.ReactNode;
  color: string;
  animation?: boolean;
}> = ({ title, value, icon, color, animation = true }) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const content = (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold">
            {value !== null ? value : <Spinner size="sm" />}
          </h3>
        </div>
        <div className={`rounded-lg p-3 bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
      </div>
    </Card>
  );

  return animation ? (
    <motion.div variants={variants} className="w-full">
      {content}
    </motion.div>
  ) : (
    content
  );
};

const Overview: React.FC<{
  overview: EntityWithPath<PlatformOverviewEntity> | null;
}> = ({ overview }) => {
  if (!overview) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-primary-700/30 border-t-primary-700" />
      </div>
    );
  }
  console.log({ overviewdata: overview.data });
  // Animation container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-primary-900">System Overview</h2>

      <div>
        <h3 className="mb-4 text-xl font-bold text-primary-900">
          Transactions
        </h3>
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            title="Total Income"
            value={overview.data.totalEarnings?.toLocaleString() || "0"}
            icon={<HiCurrencyDollar className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Driver Payouts"
            value={overview.data.totalPayout?.toLocaleString() || "0"}
            icon={<HiCurrencyDollar className="h-6 w-6" />}
            color="purple"
          />
        </motion.div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold text-primary-900">Orders</h3>
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            title="Active"
            value={overview.data.totalActiveOrders?.toLocaleString() || "0"}
            icon={<HiShoppingCart className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={overview.data.totalCompletedOrders?.toLocaleString() || "0"}
            icon={<HiCheck className="h-6 w-6" />}
            color="green"
          />
        </motion.div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold text-primary-900">Drivers</h3>
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            title="Verified"
            value={overview.data.totalVerifiedDrivers?.toLocaleString() || "0"}
            icon={<HiCheck className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Pending"
            value={
              overview.data.totalPendingVerificationDrivers?.toLocaleString() ||
              "0"
            }
            icon={<HiClock className="h-6 w-6" />}
            color="yellow"
          />
          <StatCard
            title="Rejected"
            value={
              overview.data.totalFailedVerificationDrivers?.toLocaleString() ||
              "0"
            }
            icon={<HiX className="h-6 w-6" />}
            color="red"
          />
        </motion.div>
      </div>

      <div className="text-right text-sm text-gray-900">
        Last updated:{" "}
        {overview.data.updatedAt
          ? customDateFormat(overview.data.updatedAt)
          : "Never"}
      </div>
    </div>
  );
};

export default Overview;
