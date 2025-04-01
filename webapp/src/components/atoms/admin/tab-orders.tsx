import { useState } from "react";
import {
  Table,
  Badge,
  Button,
  TextInput,
  Select,
  Modal,
  Card,
  Spinner,
  Avatar,
} from "flowbite-react";
import {
  HiSearch,
  HiLocationMarker,
  HiCurrencyDollar,
  HiClock,
  HiCheck,
  HiUser,
  HiTruck,
  HiPhone,
  HiMail,
  HiArrowRight,
} from "react-icons/hi";
import {
  EntityWithPath,
  OrderEntity,
  OrderPriority,
  OrderStatus,
} from "@freedman-trucking/types";
import { useDbOperations } from "@/hooks/use-firestore";
import { useQuery } from "@tanstack/react-query";

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentOrder, setCurrentOrder] =
    useState<EntityWithPath<OrderEntity> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { fetchOrders } = useDbOperations();

  const { data, isLoading } = useQuery({
    initialData: [],
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" color="purple" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  const filteredOrders = data.filter((order) => {
    const matchesSearch =
      order.data.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.data.clientEmail
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.data.pickupLocation?.address
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.data.deliveryLocation?.address
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" &&
        order.data.status === OrderStatus.ASSIGNED_TO_DRIVER) ||
      (statusFilter === "completed" &&
        order.data.status === OrderStatus.COMPLETED) ||
      (statusFilter === "unassigned" &&
        (order.data.status === OrderStatus.PENDING_PAYMENT ||
          order.data.status === OrderStatus.PAYMENT_RECEIVED));

    return matchesSearch && matchesStatus;
  });

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return (
          <Badge color="success" icon={HiCheck}>
            Completed
          </Badge>
        );
      case OrderStatus.ASSIGNED_TO_DRIVER:
        return (
          <Badge color="info" icon={HiTruck}>
            Assigned
          </Badge>
        );
      case OrderStatus.PAYMENT_RECEIVED:
        return (
          <Badge color="warning" icon={HiCurrencyDollar}>
            Paid
          </Badge>
        );
      case OrderStatus.PENDING_PAYMENT:
        return (
          <Badge color="gray" icon={HiClock}>
            Pending Payment
          </Badge>
        );
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const renderPriorityBadge = (priority: OrderPriority) => {
    switch (priority) {
      case OrderPriority.URGENT:
        return <Badge color="red">Urgent</Badge>;
      case OrderPriority.EXPEDITED:
        return <Badge color="yellow">Expedited</Badge>;
      case OrderPriority.STANDARD:
        return <Badge color="gray">Standard</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary-700">Orders</h2>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-full sm:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <HiSearch className="h-5 w-5 text-gray-500" />
          </div>
          <TextInput
            type="search"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="unassigned">Unassigned</option>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm">
        <Table striped>
          <Table.Head>
            <Table.HeadCell>Actions</Table.HeadCell>
            <Table.HeadCell>Order Info</Table.HeadCell>
            <Table.HeadCell>Customer</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Driver</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredOrders.map((order) => (
              <Table.Row key={order.path}>
                <Table.Cell>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => {
                      setCurrentOrder(order);
                      setShowModal(true);
                    }}
                  >
                    View Details
                  </Button>
                </Table.Cell>
                <Table.Cell>
                  <div className="font-medium">
                    {order.path.substring(0, 8)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.data.createdAt || "").toLocaleDateString()}
                  </div>
                  <div className="mt-1">
                    {renderPriorityBadge(order.data.priority)}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div>{order.data.clientName}</div>
                  <div className="text-xs text-gray-500">
                    {order.data.clientEmail}
                  </div>
                </Table.Cell>
                <Table.Cell>{renderStatusBadge(order.data.status)}</Table.Cell>
                <Table.Cell>
                  {order.data.driverId ? (
                    <div className="flex items-center space-x-2">
                      <Avatar size="xs" rounded />
                      <span>{order.data.driverName || "Unknown Driver"}</span>
                    </div>
                  ) : (
                    <Badge color="gray">Not Assigned</Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div className="font-medium">
                    ${order.data.priceInUSD || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.data.distanceInMiles?.toFixed(1)} miles
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Order Details Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        size="5xl"
        className=" bg-black bg-opacity-30 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
      >
        <Modal.Header>Order Details</Modal.Header>
        <Modal.Body className="max-h-[70vh] overflow-y-auto p-4">
          {currentOrder && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    Order #{currentOrder.path.substring(0, 8)}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    {renderStatusBadge(currentOrder.data.status)}
                    {renderPriorityBadge(currentOrder.data.priority)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${currentOrder.data.priceInUSD}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created:{" "}
                    {new Date(
                      currentOrder.data.createdAt || "",
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                  <h4 className="mb-3 text-lg font-semibold">
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <HiUser className="text-gray-500" />
                      <span>{currentOrder.data.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiMail className="text-gray-500" />
                      <span>{currentOrder.data.clientEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiPhone className="text-gray-500" />
                      <span>{currentOrder.data.clientPhone}</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h4 className="mb-3 text-lg font-semibold">
                    Pickup Location
                  </h4>
                  <div className="mb-2 flex items-start gap-2">
                    <HiLocationMarker className="mt-1 flex-shrink-0 text-gray-500" />
                    <span className="font-medium">
                      {currentOrder.data.pickupLocation?.address}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Coordinates:{" "}
                    {currentOrder.data.pickupLocation?.latitude?.toFixed(6)},{" "}
                    {currentOrder.data.pickupLocation?.longitude?.toFixed(6)}
                  </div>
                </Card>

                <Card>
                  <h4 className="mb-3 text-lg font-semibold">
                    Delivery Location
                  </h4>
                  <div className="mb-2 flex items-start gap-2">
                    <HiLocationMarker className="mt-1 flex-shrink-0 text-gray-500" />
                    <span className="font-medium">
                      {currentOrder.data.deliveryLocation?.address}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Coordinates:{" "}
                    {currentOrder.data.deliveryLocation?.latitude?.toFixed(6)},{" "}
                    {currentOrder.data.deliveryLocation?.longitude?.toFixed(6)}
                  </div>
                </Card>
              </div>

              <div className="mb-6">
                <Card>
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Order Summary</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <HiArrowRight className="text-gray-500" />
                        <span className="text-sm font-medium">
                          {currentOrder.data.distanceInMiles?.toFixed(1)} miles
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="mb-2 font-medium">Required Vehicles</h5>
                    <div className="flex flex-wrap gap-2">
                      {currentOrder.data.requiredVehicles?.map((req, index) => (
                        <Badge key={index} color="dark">
                          {req.type} x{req.quantity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="mb-2 font-medium">Products</h5>
                    <div className="overflow-x-auto">
                      <Table>
                        <Table.Head>
                          <Table.HeadCell>Product</Table.HeadCell>
                          <Table.HeadCell>Dimensions</Table.HeadCell>
                          <Table.HeadCell>Weight</Table.HeadCell>
                          <Table.HeadCell>Quantity</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                          {currentOrder.data.products?.map((product, index) => (
                            <Table.Row key={index}>
                              <Table.Cell className="font-medium">
                                {product.name}
                              </Table.Cell>
                              <Table.Cell>
                                {product.dimensions.lengthInInches}" x{" "}
                                {product.dimensions.widthInInches}" x{" "}
                                {product.dimensions.heightInInches}"
                              </Table.Cell>
                              <Table.Cell>{product.weightInLbs} lbs</Table.Cell>
                              <Table.Cell>{product.quantity}</Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table>
                    </div>
                  </div>
                </Card>
              </div>

              {currentOrder.data.driverId && (
                <Card>
                  <h4 className="mb-3 text-lg font-semibold">
                    Assigned Driver
                  </h4>
                  <div className="flex items-center gap-3">
                    <Avatar size="md" rounded />
                    <div>
                      <div className="font-medium">
                        {currentOrder.data.driverName || "Unknown Driver"}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {currentOrder.data.driverId}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Orders;
