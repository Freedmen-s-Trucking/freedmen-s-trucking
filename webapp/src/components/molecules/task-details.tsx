import {
  AccountType,
  CollectionName,
  EntityWithPath,
  OrderStatus,
  TaskGroupEntity,
  TaskGroupEntityFields,
  TaskGroupStatus,
} from "@freedmen-s-trucking/types";
import {
  AdvancedMarker,
  ControlPosition,
  InfoWindow,
  Map,
  MapControl,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import {
  Accordion,
  Avatar,
  Badge,
  Card,
  Dropdown,
  Modal,
  TextInput,
} from "flowbite-react";
import { useCallback, useMemo, useState } from "react";
import { MdOpenInNew } from "react-icons/md";
import { Order } from "./order-details";
import { twMerge } from "tailwind-merge";
import { AppImage, PrimaryButton } from "../atoms";
import { HiMail, HiPhone, HiTrash } from "react-icons/hi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerRequest } from "~/hooks/use-server-request";
import { useDbOperations } from "~/hooks/use-firestore";
import { useQuery } from "@tanstack/react-query";

const AssignDriverButton = ({
  task,
  onClose,
}: {
  task: EntityWithPath<TaskGroupEntity>;
  onClose?: () => void;
}) => {
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const { fetchDrivers } = useDbOperations();
  const { data: drivers, isLoading: isLoadingDrivers } = useQuery({
    initialData: [],
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
  });

  const { mutate: closeModal } = useMutation({
    mutationFn: async () => {
      setShowAssignDriverModal(false);
      setSelectedDriver(null);
      if (onClose) {
        onClose();
      }
    },
  });

  const queryClient = useQueryClient();
  const serverRequest = useServerRequest();
  const {
    mutateAsync: assignDriver,
    isPending: isAssigningDriver,
    isError,
    error,
  } = useMutation({
    mutationFn: async (path: string) => {
      if (!selectedDriver) {
        throw new Error("Please select a driver");
      }
      const response = await serverRequest(`/task-group/assign-driver`, {
        method: "POST",
        body: {
          taskId: path.split("/").pop() || "",
          driverId: selectedDriver || "",
        },
      });
      console.log(response);
      return response;
    },
    onSuccess(data) {
      console.log(data);
      closeModal();
      queryClient.invalidateQueries({
        queryKey: ["task-groups"],
      });
    },
    onError(error) {
      console.error(error);
    },
  });

  return (
    <>
      <PrimaryButton
        className="p-2 text-[13px]"
        onClick={() => setShowAssignDriverModal(true)}
      >
        {task.data?.driverId ? "Reassign" : "Assign Driver"}
      </PrimaryButton>
      {showAssignDriverModal && (
        <Modal show={showAssignDriverModal} onClose={closeModal}>
          <Modal.Header>Assign Driver</Modal.Header>
          <Modal.Body>
            {isLoadingDrivers ? (
              <div className="flex h-64 items-center justify-center">
                <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500" />
              </div>
            ) : (
              <div className="w-full first:[&>div]:border-none">
                <Dropdown
                  label=""
                  className="-mt-4 rounded-b-lg rounded-t-none bg-primary-50 shadow-md shadow-primary-700"
                  trigger="click"
                  renderTrigger={() => (
                    <TextInput
                      spellCheck
                      minLength={10}
                      readOnly
                      value={
                        selectedDriver
                          ? drivers?.find(
                              (driver) => driver.data.uid === selectedDriver,
                            )?.data?.displayName
                          : ""
                      }
                      id="delivery-type-input"
                      className={`block w-full cursor-pointer rounded-xl border p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent`}
                      placeholder="Select >"
                    />
                  )}
                >
                  {drivers?.map((driver) => (
                    <Dropdown.Item
                      key={driver.data.uid}
                      onClick={() => {
                        setSelectedDriver(driver.data.uid);
                      }}
                      className="hover:bg-primary-100"
                    >
                      {driver.data.displayName}
                    </Dropdown.Item>
                  ))}
                </Dropdown>
                {isError && (
                  <div className="mt-2 text-red-500">
                    <p className="text-xs">{error?.message}</p>
                  </div>
                )}
                <PrimaryButton
                  isLoading={isAssigningDriver}
                  loadingText=""
                  disabled={!selectedDriver}
                  onClick={() => {
                    assignDriver(task.path);
                  }}
                  className="mt-2 w-full text-xs"
                >
                  Assign to{" "}
                  {
                    drivers?.find(
                      (driver) => driver.data.uid === selectedDriver,
                    )?.data.displayName
                  }
                </PrimaryButton>
              </div>
            )}
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

const CustomMarker = ({
  position,
  infoWindowHeaderContent,
  infoWindowContent,
  children,
}: {
  infoWindowHeaderContent?: React.ReactNode;
  infoWindowContent?: React.ReactNode;
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  children: React.ReactNode;
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const [infoWindowShown, setInfoWindowShown] = useState(false);

  // clicking the marker will toggle the infowindow
  const handleMarkerClick = useCallback(
    () => setInfoWindowShown((isShown) => !isShown),
    [],
  );

  // if the maps api closes the infowindow, we have to synchronize our state
  const handleClose = useCallback(() => setInfoWindowShown(false), []);
  return (
    <>
      <AdvancedMarker
        onClick={handleMarkerClick}
        position={position}
        ref={markerRef}
      >
        {children}
      </AdvancedMarker>
      {(infoWindowHeaderContent || infoWindowContent) && infoWindowShown && (
        <InfoWindow
          onClose={handleClose}
          anchor={marker}
          className="m-0 p-0"
          headerContent={infoWindowHeaderContent}
        >
          {infoWindowContent}
        </InfoWindow>
      )}
    </>
  );
};

const StatusBadge: React.FC<{
  status: TaskGroupStatus;
  className?: string;
}> = ({ status, className }) => {
  switch (status) {
    case TaskGroupStatus.COMPLETED:
      return (
        <Badge color="success" className={className}>
          Completed
        </Badge>
      );
    case TaskGroupStatus.IN_PROGRESS:
      return (
        <Badge color="info" className={className}>
          In Progress
        </Badge>
      );
    case TaskGroupStatus.IDLE:
      return (
        <Badge color="warning" className={className}>
          Idle
        </Badge>
      );
    default:
      return (
        <Badge color="gray" className={className}>
          Unknown
        </Badge>
      );
  }
};

const TaskDetailsView: React.FC<{
  task: EntityWithPath<TaskGroupEntity>;
  className?: string;
  viewType: AccountType;
  onClose?: () => void;
}> = ({ task, className, viewType, onClose }) => {
  const center = useMemo(() => {
    const pickupPosition =
      task.data[TaskGroupEntityFields.pickupCenterCoordinate];
    const deliveryPosition =
      task.data[TaskGroupEntityFields.dropoffCenterCoordinate];

    return {
      lat: (pickupPosition.latitude + deliveryPosition.latitude) / 2,
      lng: (pickupPosition.longitude + deliveryPosition.longitude) / 2,
    };
  }, [task.data]);

  const driverRouteUrl = useMemo(() => {
    const pickups = Object.values(
      task.data[TaskGroupEntityFields.orderIdValueMap],
    ).map((order) => ({
      lat: order.pickupLocation.latitude,
      lng: order.pickupLocation.longitude,
    }));
    const deliveries = Object.values(
      task.data[TaskGroupEntityFields.orderIdValueMap],
    ).map((order) => ({
      lat: order.deliveryLocation.latitude,
      lng: order.deliveryLocation.longitude,
    }));
    const format = ({ lat, lng }: { lat: number; lng: number }) =>
      `${lat},${lng}`;

    const origin = format(pickups[0]);
    const destination = format(deliveries[deliveries.length - 1]);

    const waypointsList = [
      ...pickups.slice(1).map(format),
      ...deliveries.slice(0, -1).map(format),
    ];

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypointsList.join("|")}`;
  }, [task.data]);

  const queryClient = useQueryClient();
  const serverRequest = useServerRequest();
  const { mutateAsync: removeDriver, isPending: isRemovingDriver } =
    useMutation({
      mutationFn: async (path: string) => {
        const response = await serverRequest(`/task-group/remove-driver`, {
          method: "POST",
          body: {
            taskId: path.split("/").pop() || "",
          },
        });
        console.log(response);
      },
      onSuccess(data) {
        console.log(data);
        if (onClose) {
          onClose();
        }
        queryClient.invalidateQueries({
          queryKey: ["task-groups"],
        });
      },
      onError(error) {
        console.error(error);
      },
    });

  return (
    <Card
      className={twMerge(
        "[&>div]:p-2 [&>div]:sm:p-4 [&>div]:lg:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Task ID</p>
          <p className="text-sm font-semibold">
            {task.path.split("/").pop()?.slice(0, 5)}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Status</p>
          <StatusBadge status={task.data.status} />
        </div>
      </div>
      <div>
        <Card className="shadow-none [&>div]:justify-start [&>div]:p-2">
          <h4 className="text-sm font-semibold md:text-base">Driver</h4>
          {task.data?.driverId ? (
            <div>
              <div className="flex items-center gap-3 overflow-hidden">
                <AppImage
                  src={{
                    url: task.data?.driverInfo?.photoURL,
                    storage:
                      task.data?.driverInfo?.uploadedProfileStoragePath ?? null,
                  }}
                  alt="Driver"
                  fallback={<Avatar size="md" rounded />}
                />
                <div className="flex flex-col">
                  <div className="text-xs font-medium md:text-sm">
                    {task.data?.driverInfo?.displayName || "Unknown Driver"}
                  </div>
                  <span className="text-ellipsis text-nowrap break-all text-xs text-gray-500">
                    ID: {task.data?.driverId?.slice(0, 5)}
                  </span>
                </div>
              </div>
              {(task.data?.driverInfo?.email ||
                task.data?.driverInfo?.phoneNumber) && (
                <div className="space-y-2 p-2 text-xs md:text-sm">
                  {task.data?.driverInfo?.email && (
                    <div className="flex items-center gap-2">
                      <HiMail className="text-gray-500" />
                      <span>{task.data?.driverInfo?.email}</span>
                    </div>
                  )}
                  {task.data?.driverInfo?.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <HiPhone className="text-gray-500" />
                      <span>{task.data?.driverInfo?.phoneNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">No driver assigned</p>
          )}
          {viewType === "admin" && (
            <div className="flex w-full items-center justify-center gap-2">
              <AssignDriverButton onClose={onClose} task={task} />
              {task.data?.driverId && (
                <PrimaryButton
                  isLoading={isRemovingDriver}
                  loadingText=""
                  className="flex items-center gap-1 bg-orange-700 p-2 text-[13px] hover:bg-orange-800 active:bg-orange-800"
                  onClick={() => removeDriver(task.path)}
                >
                  <HiTrash size={16} /> Remove
                </PrimaryButton>
              )}
            </div>
          )}
        </Card>
      </div>
      <Accordion collapseAll className="w-full border-none">
        <Accordion.Panel className="border-none">
          <Accordion.Title className="border-b-[1px] bg-transparent p-0 text-secondary-950 hover:bg-transparent focus:right-0 focus:bg-transparent focus:ring-transparent [&>h2]:w-full">
            <span className="text-base font-semibold">View Orders In Map</span>
          </Accordion.Title>
          <Accordion.Content className="border-none px-0">
            {center ? null : (
              <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500">No location data available</p>
              </div>
            )}
            {(center && (
              <Map
                mapId={"DEMO_MAP_ID"}
                style={{ width: "100%", height: "50vh" }}
                defaultCenter={center}
                defaultZoom={13}
                minZoom={7}
                gestureHandling={"greedy"}
                disableDefaultUI={true}
              >
                <MapControl position={ControlPosition.TOP_CENTER}>
                  <a
                    href={driverRouteUrl}
                    target="_blank"
                    className="mt-2 flex items-center justify-center gap-2 rounded-full bg-white p-2 text-xs font-semibold shadow-md"
                  >
                    Open Google Maps <MdOpenInNew />
                  </a>
                </MapControl>
                {Object.entries(
                  task.data[TaskGroupEntityFields.orderIdValueMap],
                ).map(([id, order]) => (
                  <>
                    <CustomMarker
                      key={id + "01"}
                      position={{
                        lat: order.pickupLocation.latitude,
                        lng: order.pickupLocation.longitude,
                      }}
                      infoWindowHeaderContent={<span>Pickup Location</span>}
                      infoWindowContent={
                        <span>{order.pickupLocation.address}</span>
                      }
                    >
                      <Pin
                        background={"#0f9d58"}
                        borderColor={"#006425"}
                        glyphColor={"#60d98f"}
                      />
                    </CustomMarker>
                    <CustomMarker
                      key={id + "02"}
                      position={{
                        lat: order.deliveryLocation.latitude,
                        lng: order.deliveryLocation.longitude,
                      }}
                      infoWindowHeaderContent={<span>Delivery Location</span>}
                      infoWindowContent={
                        <span>{order.deliveryLocation.address}</span>
                      }
                    >
                      <Pin
                        background={"#9d580f"}
                        borderColor={"#642500"}
                        glyphColor={"#d98f60"}
                      />
                    </CustomMarker>
                  </>
                ))}
              </Map>
            )) ||
              null}
          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>
      <div>
        {Object.entries(task.data[TaskGroupEntityFields.orderIdValueMap]).map(
          ([id, order]) => (
            <div key={id}>
              <Order
                order={{
                  path: `${CollectionName.ORDERS}/${id}`,
                  data: {
                    ...order,
                    status: OrderStatus.TASKS_ASSIGNED,
                    assignedDriverId: task.data[TaskGroupEntityFields.driverId],
                  },
                }}
                viewType={viewType}
              />
            </div>
          ),
        )}
      </div>
    </Card>
  );
};

const TaskDetails: React.FC<{
  showInModal: boolean;
  onClose?: () => void;
  task: EntityWithPath<TaskGroupEntity>;
  viewType: AccountType;
}> = ({ showInModal, onClose, task, viewType }) => {
  return (
    <>
      {showInModal ? null : <TaskDetailsView task={task} viewType={viewType} />}
      {showInModal && (
        <Modal
          show={showInModal}
          onClose={onClose}
          size="5xl"
          // className=" bg-black bg-opacity-30 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
        >
          <Modal.Header>Task Details</Modal.Header>
          <Modal.Body className="max-h-[70vh] overflow-y-auto p-2">
            <TaskDetailsView
              task={task}
              viewType={viewType}
              onClose={onClose}
              className="border-none shadow-none [&>div]:p-0"
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export const Task: React.FC<{
  task: EntityWithPath<TaskGroupEntity>;
  // viewType: AccountType;
}> & {
  Details: typeof TaskDetails;
} = ({ task /*, viewType */ }) => {
  // const { user } = useAuth();

  return (
    <>
      <Card
        key={task.path}
        className={task.data.updatedAt ? "border-l-4 border-blue-500" : ""}
      ></Card>
    </>
  );
};

Task.Details = TaskDetails;
