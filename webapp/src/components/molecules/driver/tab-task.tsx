import { useEffect, useState } from "react";
import { Badge, Card, Spinner } from "flowbite-react";
import {
  DriverOrderStatus,
  TaskGroupEntity,
  TaskGroupEntityFields,
} from "@freedmen-s-trucking/types";
import { useDbOperations } from "~/hooks/use-firestore";
import { Task } from "~/components/molecules/task-details";
import { useAuth } from "~/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Title: React.FC = () => {
  const { fetchCurrentActiveTasks } = useDbOperations();
  const { user } = useAuth();
  const [activeTasks, setActiveTasks] = useState<
    { path: string; data: TaskGroupEntity }[]
  >([]);
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsubscribe = fetchCurrentActiveTasks(user.info.uid, (data) => {
      setActiveTasks(data);
      queryClient.setQueryData(["driver-active-tasks", user.info.uid], data);
    });
    return unsubscribe;
  }, [user.info.uid, fetchCurrentActiveTasks, queryClient]);

  const hasUpdatedOrders = activeTasks.some((task) =>
    Object.values(task.data[TaskGroupEntityFields.orderIdValueMap]).find(
      (order) => order.driverStatus === DriverOrderStatus.WAITING,
    ),
  );

  return (
    <div className="flex items-center">
      <span>Active Tasks</span>
      {hasUpdatedOrders && (
        <Badge color="info" className="ml-2">
          New
        </Badge>
      )}
    </div>
  );
};

const Tasks: React.FC & { Title: typeof Title } = () => {
  const { user } = useAuth();

  const { data: activeTasks, isLoading: isActiveTasksLoading } = useQuery({
    initialData: [] as { path: string; data: TaskGroupEntity }[],
    queryKey: ["driver-active-tasks", user.info.uid],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: () => [] as { path: string; data: TaskGroupEntity }[],
    throwOnError(error, query) {
      console.warn({ ref: "driver-active-tasks", error, query });
      return false;
    },
  });
  if (isActiveTasksLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" color="purple" />
      </div>
    );
  }

  if (!activeTasks || activeTasks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">No active tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-xl font-bold">Active Tasks</h2>
      <div className="mb-8 space-y-4">
        {activeTasks.map((task) => (
          <Task.Details
            key={task.path}
            showInModal={false}
            task={task}
            viewType="driver"
          />
        ))}

        {activeTasks.length === 0 && (
          <Card>
            <div className="py-4 text-center">
              <p className="text-gray-500">No active tasks at the moment.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

Tasks.Title = Title;

export default Tasks;
