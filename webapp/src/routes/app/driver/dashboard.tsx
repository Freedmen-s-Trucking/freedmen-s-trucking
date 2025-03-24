import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { Tabs, Badge, Button, Card, Avatar, Accordion } from "flowbite-react";
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
} from "react-icons/hi";

const tabs = ["overview", "active-orders", "history", "profile"] as const;

const DriverDashboard = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number] | null>(
    "overview",
  );
  const [showDriverId, setShowDriverId] = useState(false);
  const [activeOrders, setActiveOrders] = useState([
    {
      id: "ORD-2023-001",
      clientName: "John Smith",
      pickupLocation: "123 Main St, Anytown",
      targetLocation: "456 Oak Ave, Othertown",
      vehicleType: "Sedan",
      price: 35.5,
      status: "pending",
      updated: true,
      createdAt: "2025-03-24T10:30:00",
    },
    {
      id: "ORD-2023-002",
      clientName: "Sarah Johnson",
      pickupLocation: "789 Pine Rd, Sometown",
      targetLocation: "101 Maple Dr, Newtown",
      vehicleType: "SUV",
      price: 45.75,
      status: "accepted",
      updated: false,
      createdAt: "2025-03-24T09:15:00",
    },
  ]);

  const [orderHistory] = useState([
    {
      id: "ORD-2023-000",
      clientName: "Emily Wilson",
      pickupLocation: "222 First St, Downtown",
      targetLocation: "333 Second Ave, Uptown",
      vehicleType: "Sedan",
      price: 28.99,
      status: "completed",
      createdAt: "2025-03-23T15:45:00",
    },
    {
      id: "ORD-2022-123",
      clientName: "Michael Brown",
      pickupLocation: "444 Third Rd, Westside",
      targetLocation: "555 Fourth Blvd, Eastside",
      vehicleType: "Van",
      price: 52.25,
      status: "completed",
      createdAt: "2025-03-22T12:20:00",
    },
    {
      id: "ORD-2022-122",
      clientName: "Jessica Taylor",
      pickupLocation: "666 Fifth St, Northend",
      targetLocation: "777 Sixth Ave, Southend",
      vehicleType: "SUV",
      price: 42.5,
      status: "completed",
      createdAt: "2025-03-21T09:10:00",
    },
    {
      id: "ORD-2022-121",
      clientName: "David Miller",
      pickupLocation: "888 Seventh Rd, Riverside",
      targetLocation: "999 Eighth St, Lakeside",
      vehicleType: "Sedan",
      price: 32.75,
      status: "completed",
      createdAt: "2025-03-20T14:30:00",
    },
    {
      id: "ORD-2022-120",
      clientName: "Lisa Anderson",
      pickupLocation: "111 Ninth Ave, Hillside",
      targetLocation: "222 Tenth Blvd, Valleyside",
      vehicleType: "SUV",
      price: 39.99,
      status: "completed",
      createdAt: "2025-03-19T11:15:00",
    },
  ]);

  const [driverInfo] = useState({
    id: "DRV-5678-9012",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@example.com",
    profilePhoto: "/api/placeholder/150/150",
    verificationStatus: "pending", // can be 'verified', 'failed', 'pending'
    currentEarnings: 81.25,
    totalEarnings: 15489.75,
    tasksCompleted: 423,
    activeTasks: 2,
    licenseInfo: {
      number: "DL-987654321",
      expiry: "2027-05-15",
      verificationStatus: "pending",
      issues: ["The image is blurry", "Expiration date not clearly visible"],
    },
    paymentMethods: [
      { id: 1, type: "Bank Account", details: "**** 5678", default: true },
      { id: 2, type: "PayPal", details: "alex.r@example.com", default: false },
    ],
    withdrawalHistory: [
      { id: "WTH-001", amount: 250.0, date: "2025-03-15", status: "completed" },
      { id: "WTH-002", amount: 175.5, date: "2025-03-01", status: "completed" },
      { id: "WTH-003", amount: 300.0, date: "2025-02-15", status: "completed" },
    ],
  });

  const moveToNextStatus = (orderId: string) => {
    setActiveOrders((orders) =>
      orders.map((order) => {
        if (order.id === orderId) {
          const statusMap = {
            pending: "accepted",
            accepted: "on the way",
            "on the way": "picked up",
            "picked up": "delivered",
          };

          const newStatus =
            statusMap[order.status as keyof typeof statusMap] || order.status;

          // If delivered, remove from active orders (would move to history in a real app)
          if (newStatus === "delivered") {
            return { ...order, status: newStatus, updated: false };
          }

          return { ...order, status: newStatus, updated: false };
        }
        return order;
      }),
    );
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge color="success" icon={HiCheck}>
            Verified
          </Badge>
        );
      case "failed":
        return (
          <Badge color="failure" icon={HiX}>
            Verification Failed
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge color="warning" icon={HiClock}>
            Verification Pending
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge color="success">Completed</Badge>;
      case "delivered":
        return <Badge color="success">Delivered</Badge>;
      case "picked up":
        return <Badge color="indigo">Picked Up</Badge>;
      case "on the way":
        return <Badge color="info">On The Way</Badge>;
      case "accepted":
        return <Badge color="purple">Accepted</Badge>;
      case "pending":
      default:
        return <Badge color="warning">Pending</Badge>;
    }
  };

  const getNextActionButton = (order: (typeof activeOrders)[0]) => {
    const statusMap = {
      pending: { text: "Accept Order", color: "green" },
      accepted: { text: "On My Way", color: "blue" },
      "on the way": { text: "Picked Up", color: "purple" },
      "picked up": { text: "Delivered", color: "success" },
    };

    const action = statusMap[order.status as keyof typeof statusMap];

    if (!action) return null;

    return (
      <Button
        color={action.color}
        size="sm"
        onClick={() => moveToNextStatus(order.id)}
      >
        {action.text}
      </Button>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const hasUpdatedOrders = activeOrders.some((order) => order.updated);

  return (
    <div className="container mx-auto p-4">
      {/* Driver Header */}
      <div className="mb-6 flex flex-col items-center rounded-lg bg-white p-4 shadow md:flex-row">
        <div className="relative mb-4 md:mb-0 md:mr-6">
          <Avatar img={driverInfo.profilePhoto} rounded size="lg" />
          <div className="absolute -right-2 -top-2">
            {getVerificationBadge(driverInfo.verificationStatus)}
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">{driverInfo.name}</h1>
          <p className="text-gray-600">{driverInfo.email}</p>
          <div className="mt-1 flex items-center">
            <span className="mr-2">Driver ID:</span>
            {showDriverId ? (
              <span className="font-mono">{driverInfo.id}</span>
            ) : (
              <span className="font-mono">****-****-****</span>
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
      </div>

      {/* Tabs */}
      <Tabs
        style="underline"
        onActiveTabChange={(tab) => setActiveTab(tabs[tab])}
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
                ${driverInfo.currentEarnings.toFixed(2)}
              </p>
            </Card>
            <Card>
              <h5 className="text-lg font-bold tracking-tight text-gray-900">
                Total Earnings
              </h5>
              <p className="text-3xl font-bold text-green-600">
                ${driverInfo.totalEarnings.toFixed(2)}
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
              {activeOrders.slice(0, 2).map((order) => (
                <Card
                  key={order.id}
                  className={order.updated ? "border-l-4 border-blue-500" : ""}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-lg font-bold tracking-tight text-gray-900">
                        {order.clientName}
                      </h5>
                      <p className="mb-2 font-normal text-gray-700 dark:text-gray-400">
                        {order.id} • {order.vehicleType}
                      </p>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <strong>Pickup:</strong> {order.pickupLocation}
                    </p>
                    <p>
                      <strong>Dropoff:</strong> {order.targetLocation}
                    </p>
                    <p className="mt-2 text-lg font-bold">
                      ${order.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    {getNextActionButton(order)}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent History */}
          <div>
            <h2 className="mb-3 text-xl font-bold">Recent Orders</h2>
            <Card>
              <div className="flow-root">
                <ul className="divide-y divide-gray-200">
                  {orderHistory.slice(0, 5).map((order) => (
                    <li key={order.id} className="py-3 sm:py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {order.clientName}
                          </p>
                          <p className="truncate text-sm text-gray-500">
                            {order.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                          ${order.price.toFixed(2)}
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
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
            {activeOrders.map((order) => (
              <Card
                key={order.id}
                className={order.updated ? "border-l-4 border-blue-500" : ""}
              >
                <div className="flex flex-col justify-between md:flex-row">
                  <div className="mb-3 md:mb-0">
                    <h5 className="text-lg font-bold tracking-tight text-gray-900">
                      Order {order.id}
                    </h5>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Client: {order.clientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="mb-2">{getStatusBadge(order.status)}</div>
                    <p className="text-lg font-bold text-gray-900">
                      ${order.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{order.vehicleType}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold">Pickup Location:</p>
                    <p className="text-sm text-gray-700">
                      {order.pickupLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Dropoff Location:</p>
                    <p className="text-sm text-gray-700">
                      {order.targetLocation}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Accordion collapseAll className="w-full">
                    <Accordion.Panel>
                      <Accordion.Title>View Map</Accordion.Title>
                      <Accordion.Content>
                        <div className="flex h-64 items-center justify-center bg-gray-200 text-gray-500">
                          <p>Map with route would appear here</p>
                        </div>
                      </Accordion.Content>
                    </Accordion.Panel>
                  </Accordion>
                </div>

                <div className="mt-3 flex justify-end">
                  {getNextActionButton(order)}
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
            {orderHistory.map((order) => (
              <Card key={order.id}>
                <div className="flex flex-col justify-between md:flex-row">
                  <div className="mb-3 md:mb-0">
                    <h5 className="text-lg font-bold tracking-tight text-gray-900">
                      Order {order.id}
                    </h5>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Client: {order.clientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="mb-2">{getStatusBadge(order.status)}</div>
                    <p className="text-lg font-bold text-gray-900">
                      ${order.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{order.vehicleType}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold">Pickup Location:</p>
                    <p className="text-sm text-gray-700">
                      {order.pickupLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Dropoff Location:</p>
                    <p className="text-sm text-gray-700">
                      {order.targetLocation}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Accordion collapseAll className="w-full">
                    <Accordion.Panel>
                      <Accordion.Title>View Map</Accordion.Title>
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
            {/* Personal Information */}
            <Card className="lg:col-span-2">
              <h5 className="mb-4 text-xl font-bold">Personal Information</h5>
              <div className="mb-6 flex flex-col sm:flex-row">
                <div className="mb-4 sm:mb-0 sm:mr-6">
                  <Avatar img={driverInfo.profilePhoto} size="xl" rounded />
                  <Button size="xs" className="mt-2 w-full">
                    Change Photo
                  </Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={driverInfo.name}
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
                      value={driverInfo.email}
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
                    <div>
                      <p>
                        <strong>License Number:</strong>{" "}
                        {driverInfo.licenseInfo.number}
                      </p>
                      <p>
                        <strong>Expiry Date:</strong>{" "}
                        {driverInfo.licenseInfo.expiry}
                      </p>
                    </div>
                    <div>
                      {getVerificationBadge(
                        driverInfo.licenseInfo.verificationStatus,
                      )}
                    </div>
                  </div>

                  {driverInfo.licenseInfo.verificationStatus === "failed" && (
                    <div className="mt-3 border-l-4 border-red-400 bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Verification Issues
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <ul className="list-disc space-y-1 pl-5">
                              {driverInfo.licenseInfo.issues.map(
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
                    <Button color="light">View License</Button>
                    {driverInfo.licenseInfo.verificationStatus === "failed" && (
                      <Button color="failure">Upload New License</Button>
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
                <Button color="light">Add Payment Method</Button>
              </Card>

              {/* Withdrawals */}
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <h5 className="text-xl font-bold">Withdrawals</h5>
                  <Button color="blue">Request Withdrawal</Button>
                </div>
                <div className="space-y-3">
                  <p className="font-medium">Available for withdrawal:</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${driverInfo.currentEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="mt-4">
                  <h6 className="mb-2 font-medium">Recent Withdrawals</h6>
                  <div className="flow-root">
                    <ul className="divide-y divide-gray-200">
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
