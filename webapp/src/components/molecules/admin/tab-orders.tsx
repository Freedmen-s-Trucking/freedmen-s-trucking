import { useState } from "react";
import {
  Table,
  Badge,
  Button,
  TextInput,
  Select,
  Spinner,
  Avatar,
} from "flowbite-react";
import { HiSearch, HiCurrencyDollar, HiCheck, HiTruck } from "react-icons/hi";
import {
  EntityWithPath,
  TaskGroupEntity,
  TaskGroupEntityFields,
  TaskGroupStatus,
} from "@freedmen-s-trucking/types";
import { useDbOperations } from "~/hooks/use-firestore";
import { useQuery } from "@tanstack/react-query";
import { Task } from "~/components/molecules/task-details";
import { customDateFormat } from "~/utils/functions";
import { AppImage } from "~/components/atoms";

const renderStatusBadge = (status: TaskGroupStatus) => {
  switch (status) {
    case TaskGroupStatus.COMPLETED:
      return (
        <Badge color="success" icon={HiCheck}>
          Completed
        </Badge>
      );
    case TaskGroupStatus.IN_PROGRESS:
      return (
        <Badge color="info" icon={HiTruck}>
          In Progress
        </Badge>
      );
    case TaskGroupStatus.IDLE:
      return (
        <Badge color="warning" icon={HiCurrencyDollar}>
          Idle
        </Badge>
      );
    default:
      return <Badge color="gray">Unknown</Badge>;
  }
};

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "in-progress" | "completed" | "unassigned" | "idle"
  >("all");
  const [currentTask, setCurrentTask] =
    useState<EntityWithPath<TaskGroupEntity> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { fetchTaskGroups } = useDbOperations();

  // const { data: ordersData, isLoading: ordersLoading } = useQuery({
  //   initialData: [],
  //   queryKey: ["orders"],
  //   queryFn: fetchOrders,
  // });

  const { data: taskGroupsData, isLoading: taskGroupsLoading } = useQuery({
    initialData: [],
    queryKey: ["task-groups"],
    queryFn: fetchTaskGroups,
    throwOnError(error) {
      console.error(error);
      return false;
    },
  });

  if (taskGroupsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" color="purple" />
      </div>
    );
  }

  if (!taskGroupsData || taskGroupsData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  const filteredTasks = taskGroupsData.filter((taskGroup) => {
    const matchesSearch = Object.values(
      taskGroup.data[TaskGroupEntityFields.orderIdValueMap],
    ).find((order) => {
      return (
        order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.pickupLocation?.address
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.deliveryLocation?.address
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in-progress" &&
        taskGroup.data.status === TaskGroupStatus.IN_PROGRESS) ||
      (statusFilter === "completed" &&
        taskGroup.data.status === TaskGroupStatus.COMPLETED) ||
      (statusFilter === "unassigned" &&
        !taskGroup.data[TaskGroupEntityFields.driverId]) ||
      (statusFilter === "idle" &&
        taskGroup.data.status === TaskGroupStatus.IDLE);

    return !!matchesSearch && matchesStatus;
  });

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
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
          >
            <option value="all">All Statuses</option>
            <option value="unassigned">Unassigned</option>
            <option value="idle">Idle</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm">
        <Table striped>
          <Table.Head>
            <Table.HeadCell>Actions</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Driver</Table.HeadCell>
            <Table.HeadCell>Total Price</Table.HeadCell>
            <Table.HeadCell>Driver Fees</Table.HeadCell>
            <Table.HeadCell>Order Count</Table.HeadCell>
            <Table.HeadCell className="min-w-32">Created At</Table.HeadCell>
            <Table.HeadCell className="min-w-32">Updated At</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredTasks.map((task) => (
              <Table.Row key={task.path} className="text-xs">
                <Table.Cell>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => {
                      setCurrentTask(task);
                      setShowModal(true);
                    }}
                  >
                    <u>View Details</u>
                  </Button>
                </Table.Cell>
                <Table.Cell>{renderStatusBadge(task.data.status)}</Table.Cell>
                <Table.Cell>
                  {task.data?.driverId && task.data.driverInfo ? (
                    <div className="flex items-center space-x-2">
                      <AppImage
                        src={{
                          url: task.data.driverInfo.photoURL,
                          storage:
                            task.data.driverInfo.uploadedProfileStoragePath ||
                            null,
                        }}
                        alt={task.data.driverInfo.displayName || ""}
                        fallback={<Avatar size="md" rounded />}
                      />
                      <span>
                        {task.data.driverInfo.displayName || "Unknown Driver"}
                      </span>
                    </div>
                  ) : (
                    <Badge color="gray">Not Assigned</Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div className="font-medium">
                    $
                    {Object.values(
                      task.data[TaskGroupEntityFields.orderIdValueMap],
                    ).reduce((acc, order) => acc + order.priceInUSD, 0)}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="font-medium">
                    $
                    {Object.values(
                      task.data[TaskGroupEntityFields.orderIdValueMap],
                    ).reduce((acc, order) => acc + order.driverFeesInUSD, 0)}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {
                    Object.values(
                      task.data[TaskGroupEntityFields.orderIdValueMap],
                    ).length
                  }
                </Table.Cell>
                <Table.Cell>{customDateFormat(task.data.createdAt)}</Table.Cell>
                <Table.Cell>{customDateFormat(task.data.updatedAt)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Task Group Details Modal */}
      {showModal && currentTask && (
        <Task.Details
          showInModal
          onClose={() => setShowModal(false)}
          task={currentTask}
          viewType="admin"
        />
      )}
    </div>
  );
};

export default Orders;
