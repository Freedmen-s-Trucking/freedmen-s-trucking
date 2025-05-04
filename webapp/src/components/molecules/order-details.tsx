import {
  AccountType,
  DriverOrderStatus,
  EntityWithPath,
  OrderEntity,
  OrderEntityFields,
  OrderPriority,
  OrderStatus,
  RequiredVehicleEntity,
} from "@freedmen-s-trucking/types";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  createStaticMapsUrl,
  InfoWindow,
  Map,
  Pin,
  StaticMap,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { Accordion, Avatar, Badge, Card, Modal, Table } from "flowbite-react";
import { useMemo } from "react";
import { BsTrainFreightFront } from "react-icons/bs";
import { FaMapMarkerAlt } from "react-icons/fa";
import { GiTruck } from "react-icons/gi";
import { HiArrowRight, HiMail, HiPhone, HiUser } from "react-icons/hi";
import { IoCarOutline } from "react-icons/io5";
import { PiVanBold } from "react-icons/pi";
import { TbCarSuv, TbTruckDelivery } from "react-icons/tb";
import { useAuth } from "~/hooks/use-auth";
import { GOOGLE_MAPS_API_KEY } from "~/utils/envs";
import { customDateFormat, formatPrice } from "~/utils/functions";
import GetNextActionButton from "./change-order-status-modal";

const driverStatusMap: Record<
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

const StatusBadge: React.FC<{
  status: OrderStatus;
  // driverStatus: DriverOrderStatus | null;
  // viewType: AccountType;
  className?: string;
}> = ({ status, className }) => {
  // if (viewType === "driver") {
  // return driverStatusMap[driverStatus || DriverOrderStatus.WAITING].badge;
  // }

  let badge = (
    <Badge color="warning" className={className}>
      Pending Payment
    </Badge>
  );
  switch (status) {
    case OrderStatus.PAYMENT_RECEIVED:
      return (
        <Badge color="green" className={className}>
          Payment Received
        </Badge>
      );
    case OrderStatus.TASKS_ASSIGNED:
      badge = (
        <Badge color="info" className={className}>
          Tasks Assigned
        </Badge>
      );
      break;
    case OrderStatus.COMPLETED:
      badge = (
        <Badge color="success" className={className}>
          Completed
        </Badge>
      );
      break;
  }
  // switch (driverStatus) {
  //   case DriverOrderStatus.ACCEPTED:
  //   case DriverOrderStatus.ON_THE_WAY_TO_PICKUP:
  //     return (
  //       <Badge color="green" className={className}>
  //         Package Accepted By Driver
  //       </Badge>
  //     );
  //   case DriverOrderStatus.ON_THE_WAY_TO_DELIVER:
  //     return (
  //       <Badge color="purple" className={className}>
  //         Package Picked Up & In Route To Delivery
  //       </Badge>
  //     );
  //   case DriverOrderStatus.DELIVERED:
  //     return (
  //       <Badge color="success" className={className}>
  //         Delivered
  //       </Badge>
  //     );
  // }

  return badge;
};

const DisplayRequiredVehicles: React.FC<{
  vehicles: RequiredVehicleEntity[] | undefined;
}> = ({ vehicles }) => {
  const vehicleIcons: Record<RequiredVehicleEntity["type"], React.ReactNode> = {
    SEDAN: <IoCarOutline />,
    SUV: <TbCarSuv />,
    VAN: <PiVanBold />,
    TRUCK: <GiTruck />,
    FREIGHT: <BsTrainFreightFront />,
  };
  return (
    <div className="flex items-center gap-2">
      {(vehicles || []).map((vehicle) => (
        <span key={vehicle.type} className="flex items-center">
          <span className="text-sm">{vehicle.quantity}&nbsp;*&nbsp;</span>
          {vehicleIcons[vehicle.type]}
        </span>
      ))}
    </div>
  );
};

const PriorityBadge: React.FC<{ priority: OrderPriority }> = ({ priority }) => {
  switch (priority) {
    case OrderPriority.URGENT:
      return <Badge color="red">Urgent</Badge>;
    case OrderPriority.EXPEDITED:
      return <Badge color="yellow">Expedited</Badge>;
    case OrderPriority.STANDARD:
      return <Badge color="gray">Standard</Badge>;
    default:
      return <Badge color="gray">Unknown</Badge>;
  }
};

const OrderDetailsView: React.FC<{
  order: EntityWithPath<OrderEntity>;
  viewType: AccountType;
}> = ({ order, viewType }) => {
  const [pickupMarkerRef, pickupMarker] = useAdvancedMarkerRef();
  const [deliveryMarkerRef, deliveryMarker] = useAdvancedMarkerRef();
  const pickupPosition = useMemo(() => {
    const pickupLocation = order.data.pickupLocation;
    if (!pickupLocation) {
      return null;
    }
    return {
      lat: pickupLocation.latitude,
      lng: pickupLocation.longitude,
    };
  }, [order]);

  const deliveryPosition = useMemo(() => {
    const deliveryLocation = order.data.deliveryLocation;
    if (!deliveryLocation) {
      return null;
    }
    return {
      lat: deliveryLocation.latitude,
      lng: deliveryLocation.longitude,
    };
  }, [order]);

  const center = useMemo(() => {
    if (!pickupPosition || !deliveryPosition) {
      return null;
    }
    return {
      lat: (pickupPosition.lat + deliveryPosition.lat) / 2,
      lng: (pickupPosition.lng + deliveryPosition.lng) / 2,
    };
  }, [pickupPosition, deliveryPosition]);

  const staticMapsUrl = createStaticMapsUrl({
    apiKey: GOOGLE_MAPS_API_KEY,
    width: 512,
    height: 288,
    scale: 2,
    markers: [
      {
        location: {
          lat: pickupPosition!.lat,
          lng: pickupPosition!.lng,
        },
        color: "0x0f9d58",
        label: "Pickup Location",
      },
      {
        location: {
          lat: deliveryPosition!.lat,
          lng: deliveryPosition!.lng,
        },
        color: "0xcd383f",
        label: "Delivery Location",
      },
    ],
  });

  const { user } = useAuth();
  const driverTask = order.data[`task-${user.info.uid}`] || null;

  if (!driverTask && viewType === "driver") {
    console.log(order);
    return <p>The driver is not defined</p>;
  }

  const isAuthorizedToViewTasks =
    user.info.isAdmin ||
    user.info.uid === order.data[OrderEntityFields.ownerId];

  return (
    <Card className="[&>div]:p-2 [&>div]:sm:p-4 [&>div]:lg:p-8">
      <div>
        <div className="mb-6 w-full columns-2 items-center justify-between overflow-hidden text-xs sm:text-sm md:text-xl">
          <div className="columns-1">
            <h3 className="font-bold">
              ORD:{order.path.split("/").pop()?.slice(0, 8)}-****-****
            </h3>
            <div className="mt-1 inline-block space-x-0 space-y-2">
              <StatusBadge status={order.data.status} className="text-end" />
            </div>
          </div>
          <div className="columns-1 text-right sm:columns-auto">
            <div className="text-sm font-bold sm:text-base md:text-xl">
              {formatPrice(order.data.priceInUSD)}
            </div>
            <div className="text-xs text-gray-500 sm:text-base">
              {order.data.createdAt &&
                customDateFormat(order.data.createdAt, "")}
            </div>
          </div>
        </div>
        <div className="mb-4 flex w-full items-center justify-between text-xs sm:text-sm md:text-lg">
          <div className="flex flex-col  justify-between">
            <h5 className="mb-2 font-medium">Required Vehicles</h5>
            <div className="flex flex-wrap gap-2">
              {order.data.requiredVehicles?.map((req, index) => (
                <Badge key={index} color="dark">
                  {req.type} x{req.quantity}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-1">
              <HiArrowRight className="text-gray-500" />
              <span className="text-sm font-medium">
                {order.data.distanceInMiles?.toFixed(1)} miles
              </span>
            </div>
            <PriorityBadge priority={order.data.priority} />
          </div>
        </div>

        <div>
          <h5 className="mb-2 font-medium">Products</h5>
          <div className="mb-4 overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell>Product</Table.HeadCell>
                <Table.HeadCell>Dimensions</Table.HeadCell>
                <Table.HeadCell>Weight</Table.HeadCell>
                <Table.HeadCell>Quantity</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {order.data.products?.map((product, index) => (
                  <Table.Row key={index}>
                    <Table.Cell className="text-xs font-medium sm:text-sm md:text-base">
                      {product.name}
                    </Table.Cell>
                    <Table.Cell className="text-xs sm:text-sm md:text-base">
                      {product.estimatedDimensions.lengthInInches}" x{" "}
                      {product.estimatedDimensions.widthInInches}" x{" "}
                      {product.estimatedDimensions.heightInInches}"
                    </Table.Cell>
                    <Table.Cell className="text-xs sm:text-sm md:text-base">
                      {product.estimatedWeightInLbsPerUnit} lbs
                    </Table.Cell>
                    <Table.Cell>{product.quantity}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 text-xs sm:grid-cols-2 md:text-base">
          {(viewType !== "customer" && (
            <Card className="shadow-none [&>div]:p-2">
              <h4 className="text-sm font-semibold md:mb-3 md:text-lg">
                Customer Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HiUser className="text-gray-500" />
                  <span>{order.data.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiMail className="text-gray-500" />
                  <span>{order.data.clientEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiPhone className="text-gray-500" />
                  <span>{order.data.clientPhone}</span>
                </div>
              </div>
            </Card>
          )) ||
            null}
          {(isAuthorizedToViewTasks && (
            <Card className="shadow-none [&>div]:justify-start [&>div]:p-2">
              <h4 className="text-sm font-semibold md:text-base">
                Assigned Tasks
              </h4>
              {(order.data[OrderEntityFields.assignedDriverIds] || []).map(
                (driverId, index) => (
                  <div key={driverId}>
                    {index > 0 && <hr className="my-2" />}
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar size="md" rounded />
                      <div className="flex flex-col">
                        <div className="text-xs font-medium md:text-sm">
                          {order.data?.[`task-${driverId}`]?.driverName ||
                            "Unknown Driver"}
                        </div>
                        <span className="text-ellipsis text-nowrap break-all text-xs text-gray-500">
                          ID: {driverId.slice(0, 5)}-*****
                        </span>
                      </div>
                    </div>
                    {(order.data?.[`task-${driverId}`]?.driverEmail ||
                      order.data?.[`task-${driverId}`]?.driverPhone) && (
                      <div className="space-y-2 p-2 text-xs md:text-sm">
                        {order.data?.[`task-${driverId}`]?.driverEmail && (
                          <div className="flex items-center gap-2">
                            <HiMail className="text-gray-500" />
                            <span>
                              {order.data?.[`task-${driverId}`]?.driverEmail}
                            </span>
                          </div>
                        )}
                        {order.data?.[`task-${driverId}`]?.driverPhone && (
                          <div className="flex items-center gap-2">
                            <HiPhone className="text-gray-500" />
                            <span>
                              {order.data?.[`task-${driverId}`]?.driverPhone}
                            </span>
                          </div>
                        )}
                        {order.data?.[`task-${driverId}`]?.driverStatus && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex">
                              status:{" "}
                              {
                                driverStatusMap[
                                  order.data?.[`task-${driverId}`]?.driverStatus
                                ].badge
                              }
                            </span>
                          </div>
                        )}
                        {user.info.isAdmin &&
                          order.data?.[`task-${driverId}`]?.deliveryFee && (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex">
                                Delivery Fee:{" "}
                                {formatPrice(
                                  order.data?.[`task-${driverId}`]?.deliveryFee,
                                )}
                              </span>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ),
              )}
            </Card>
          )) ||
            null}
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div>
            <span className="mb-0 text-sm font-semibold">Pickup Location</span>
            <div className="mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-xl text-green-500" />
              <span className="text-xs">
                {order.data.pickupLocation?.address}
              </span>
            </div>
          </div>
          <div>
            <span className="mb-0 text-sm font-semibold">Dropoff Location</span>
            <div className="mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-xl text-red-700" />
              <span className="text-xs">
                {order.data.deliveryLocation?.address}
              </span>
            </div>
          </div>
        </div>
        <Accordion collapseAll className="w-full border-none">
          <Accordion.Panel className="border-none">
            <Accordion.Title className="border-b-[1px] bg-transparent p-0 text-secondary-950 hover:bg-transparent focus:right-0 focus:bg-transparent focus:ring-transparent [&>h2]:w-full">
              <span className="text-base font-semibold">View On Map</span>
            </Accordion.Title>
            <Accordion.Content className="border-none px-0">
              {center ? null : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-gray-500">No location data available</p>
                </div>
              )}
              {(center && (
                /* viewType === "driver" && */ <Map
                  mapId={"DEMO_MAP_ID"}
                  style={{ width: "100%", height: "50vh" }}
                  defaultCenter={center}
                  defaultZoom={10}
                  minZoom={7}
                  gestureHandling={"greedy"}
                  disableDefaultUI={true}
                >
                  <AdvancedMarker
                    position={pickupPosition}
                    ref={pickupMarkerRef}
                  >
                    <Pin
                      background={"#0f9d58"}
                      borderColor={"#006425"}
                      glyphColor={"#60d98f"}
                    />
                  </AdvancedMarker>
                  <InfoWindow
                    anchor={pickupMarker}
                    className="m-0 p-0"
                    headerContent={<span>Pickup Location</span>}
                  />
                  <AdvancedMarker
                    position={deliveryPosition}
                    ref={deliveryMarkerRef}
                  />
                  <InfoWindow
                    anchor={deliveryMarker}
                    className="m-0 p-0"
                    headerContent={<span>Delivery Location</span>}
                  />
                  {(order.data[OrderEntityFields.assignedDriverIds] || []).map(
                    (driverId, index) => (
                      <>
                        {Object.entries(
                          order.data?.[`task-${driverId}`]?.driverPositions ||
                            {},
                        ).map(([status, position]) => (
                          <AdvancedMarker
                            key={`${index}-${status}`}
                            position={{
                              lat: position.latitude,
                              lng: position.longitude,
                            }}
                            anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                          >
                            <TbTruckDelivery size={32} color="#472E1E" />
                          </AdvancedMarker>
                        ))}
                      </>
                    ),
                  )}
                </Map>
              )) ||
                null}
              {(center && <>{null}</>) || <StaticMap url={staticMapsUrl} />}
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
        {viewType === "driver" && (
          <div className="mt-3 flex justify-end">
            <GetNextActionButton
              orderPath={order.path}
              action={
                driverStatusMap[
                  driverTask?.driverStatus || DriverOrderStatus.WAITING
                ]
              }
            />
          </div>
        )}
      </div>
    </Card>
  );
};

const OrderDetails: React.FC<{
  showInModal: boolean;
  onClose?: () => void;
  order: EntityWithPath<OrderEntity>;
  viewType: AccountType;
}> = ({ showInModal, onClose, order, viewType }) => {
  return (
    <>
      {showInModal ? null : (
        <OrderDetailsView order={order} viewType={viewType} />
      )}
      {showInModal && (
        <Modal
          show={showInModal}
          onClose={onClose}
          size="5xl"
          // className=" bg-black bg-opacity-30 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
        >
          <Modal.Header>Order Details</Modal.Header>
          <Modal.Body className="max-h-[70vh] overflow-y-auto p-4">
            <OrderDetailsView order={order} viewType={viewType} />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export const Order: React.FC<{
  order: EntityWithPath<OrderEntity>;
  viewType: AccountType;
}> & {
  Details: typeof OrderDetails;
} = ({ order, viewType }) => {
  const { user } = useAuth();
  const driverTask = order.data[`task-${user.info.uid}`] || null;

  return (
    <>
      <Card
        key={order.path}
        className={order.data.updatedAt ? "border-l-4 border-blue-500" : ""}
      >
        <div className="flex items-start justify-between">
          <div>
            <h5 className="text-lg font-bold tracking-tight text-secondary-950">
              {order.data.clientName}
            </h5>
            <div className="mb-2 font-normal text-secondary-800 dark:text-gray-400">
              <span>
                ORD:{order.path.split("/").pop()?.slice(0, 8)}-****-****
              </span>
              <div>
                <DisplayRequiredVehicles
                  vehicles={order.data.requiredVehicles || []}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={order.data.status} className="text-end" />
            <p className="text-lg font-bold text-secondary-950">
              {formatPrice(order.data.priceInUSD)}
            </p>
          </div>
        </div>
        <div className="text-sm">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <span className="mb-0 text-sm font-semibold">
                Pickup Location
              </span>
              <div className="mb-0 flex items-center gap-2">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-xl text-green-500" />
                <span className="text-xs">
                  {order.data.pickupLocation?.address}
                </span>
              </div>
            </div>
            <div>
              <span className="mb-0 text-sm font-semibold">
                Dropoff Location
              </span>
              <div className="mb-0 flex items-center gap-2">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-xl text-red-700" />
                <span className="text-xs">
                  {order.data.deliveryLocation?.address}
                </span>
              </div>
            </div>
          </div>
        </div>
        {viewType === "driver" && (
          <div className="mt-3 flex justify-end">
            <GetNextActionButton
              orderPath={order.path}
              action={
                driverStatusMap[
                  driverTask?.driverStatus || DriverOrderStatus.WAITING
                ]
              }
            />
          </div>
        )}
      </Card>
    </>
  );
};

Order.Details = OrderDetails;
