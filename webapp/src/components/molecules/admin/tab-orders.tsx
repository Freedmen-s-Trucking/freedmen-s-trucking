import { useState } from "react";
import {
  Table,
  Badge,
  Button,
  TextInput,
  Select,
  Spinner,
} from "flowbite-react";
import { HiSearch, HiCurrencyDollar, HiCheck, HiTruck } from "react-icons/hi";
import {
  EntityWithPath,
  OrderEntity,
  OrderEntityFields,
  OrderPriority,
  OrderStatus,
} from "@freedmen-s-trucking/types";
import { useDbOperations } from "~/hooks/use-firestore";
import { useQuery } from "@tanstack/react-query";
import { Order } from "~/components/molecules/order-details";
import { customDateFormat } from "~/utils/functions";

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
        order.data.status === OrderStatus.TASKS_ASSIGNED) ||
      (statusFilter === "completed" &&
        order.data.status === OrderStatus.COMPLETED) ||
      (statusFilter === "unassigned" &&
        order.data.status === OrderStatus.PAYMENT_RECEIVED);

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
      case OrderStatus.TASKS_ASSIGNED:
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
                    <u>View Details</u>
                  </Button>
                </Table.Cell>
                <Table.Cell>
                  <div className="font-medium">
                    {order.path.substring(0, 8)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {customDateFormat(order.data.createdAt || "")}
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
                  {order.data?.[OrderEntityFields.assignedDriverId] ? (
                    <div className="flex items-center space-x-2">
                      <span>
                        {order.data?.[OrderEntityFields.task]?.driverName ||
                          "Unknown Driver"}
                      </span>
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
      {showModal && currentOrder && (
        <Order.Details
          showInModal
          onClose={() => setShowModal(false)}
          order={currentOrder}
          viewType="admin"
        />
      )}
    </div>
  );
};

export default Orders;
