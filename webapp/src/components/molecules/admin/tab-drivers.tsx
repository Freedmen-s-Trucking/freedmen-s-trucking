import React, { useState } from "react";
import {
  Table,
  Badge,
  Button,
  Select,
  Modal,
  Tabs,
  Card,
  Spinner,
  Avatar,
  Accordion,
} from "flowbite-react";
import {
  HiSearch,
  HiCheck,
  HiX,
  HiClock,
  HiIdentification,
  HiTruck,
  HiDocumentText,
  HiLocationMarker,
  HiPhone,
  HiMail,
} from "react-icons/hi";
import { useDbOperations } from "~/hooks/use-firestore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EntityWithPath,
  DriverEntity,
  VerificationStatus,
  UserEntity,
  ApiReqSendBatchMessage,
  type,
} from "@freedmen-s-trucking/types";
import { AppImage } from "~/components/atoms";
import { MdHideImage } from "react-icons/md";
// import { ImCancelCircle } from "react-icons/im";
import { useStorageOperations } from "~/hooks/use-storage";
import { tabTheme } from "~/utils/constants";
import { SecondaryButton, TextInput } from "~/components/atoms";
import { formatPrice, getDriverVerificationStatus } from "~/utils/functions";
import {
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { TbMessageUser } from "react-icons/tb";
import { useServerRequest } from "~/hooks/use-server-request";
import { TextArea } from "~/components/atoms/base";
import { FaSms } from "react-icons/fa";
import { showInfoBubble } from "~/stores/controllers/app-ctrl";
import { useAppDispatch } from "~/stores/hooks";

const btTheme = {
  base: "group relative flex items-stretch justify-center p-0.5 text-center font-medium transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow] focus:z-10 focus:outline-none",
  fullSized: "w-full",
  color: {
    dark: "border border-transparent bg-gray-800 text-white focus:ring-4 focus:ring-gray-300 enabled:hover:bg-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-gray-800 dark:enabled:hover:bg-gray-700",
    failure:
      "border border-transparent bg-red-700 text-white focus:ring-4 focus:ring-red-300 enabled:hover:bg-red-800 dark:bg-red-600 dark:focus:ring-red-900 dark:enabled:hover:bg-red-700",
    gray: ":ring-cyan-700 border border-gray-200 bg-white text-gray-900 focus:text-cyan-700 focus:ring-4 enabled:hover:bg-gray-100 enabled:hover:text-cyan-700 dark:border-gray-600 dark:bg-transparent dark:text-gray-400 dark:enabled:hover:bg-gray-700 dark:enabled:hover:text-white",
    info: "border border-transparent bg-cyan-700 text-white focus:ring-4 focus:ring-cyan-300 enabled:hover:bg-cyan-800 dark:bg-cyan-600 dark:focus:ring-cyan-800 dark:enabled:hover:bg-cyan-700",
    light:
      "border border-gray-300 bg-white text-gray-900 focus:ring-4 focus:ring-cyan-300 enabled:hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-600 dark:text-white dark:focus:ring-gray-700 dark:enabled:hover:border-gray-700 dark:enabled:hover:bg-gray-700",
    purple:
      "border border-transparent bg-purple-700 text-white focus:ring-4 focus:ring-purple-300 enabled:hover:bg-purple-800 dark:bg-purple-600 dark:focus:ring-purple-900 dark:enabled:hover:bg-purple-700",
    success:
      "border border-transparent bg-green-700 text-white focus:ring-4 focus:ring-green-300 enabled:hover:bg-green-800 dark:bg-green-600 dark:focus:ring-green-800 dark:enabled:hover:bg-green-700",
    warning:
      "border border-transparent bg-yellow-400 text-white focus:ring-4 focus:ring-yellow-300 enabled:hover:bg-yellow-500 dark:focus:ring-yellow-900",
    blue: "border border-transparent bg-blue-700 text-white focus:ring-4 focus:ring-blue-300 enabled:hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
    cyan: "border border-cyan-300 bg-white text-cyan-900 focus:ring-4 focus:ring-cyan-300 enabled:hover:bg-cyan-100 dark:border-cyan-600 dark:bg-cyan-600 dark:text-white dark:focus:ring-cyan-700 dark:enabled:hover:border-cyan-700 dark:enabled:hover:bg-cyan-700",
    green:
      "border border-green-300 bg-white text-green-900 focus:ring-4 focus:ring-green-300 enabled:hover:bg-green-100 dark:border-green-600 dark:bg-green-600 dark:text-white dark:focus:ring-green-700 dark:enabled:hover:border-green-700 dark:enabled:hover:bg-green-700",
    indigo:
      "border border-indigo-300 bg-white text-indigo-900 focus:ring-4 focus:ring-indigo-300 enabled:hover:bg-indigo-100 dark:border-indigo-600 dark:bg-indigo-600 dark:text-white dark:focus:ring-indigo-700 dark:enabled:hover:border-indigo-700 dark:enabled:hover:bg-indigo-700",
    lime: "border border-lime-300 bg-white text-lime-900 focus:ring-4 focus:ring-lime-300 enabled:hover:bg-lime-100 dark:border-lime-600 dark:bg-lime-600 dark:text-white dark:focus:ring-lime-700 dark:enabled:hover:border-lime-700 dark:enabled:hover:bg-lime-700",
    pink: "border border-pink-300 bg-white text-pink-900 focus:ring-4 focus:ring-pink-300 enabled:hover:bg-pink-100 dark:border-pink-600 dark:bg-pink-600 dark:text-white dark:focus:ring-pink-700 dark:enabled:hover:border-pink-700 dark:enabled:hover:bg-pink-700",
    red: "border border-red-300 bg-white text-red-900 focus:ring-4 focus:ring-red-300 enabled:hover:bg-red-100 dark:border-red-600 dark:bg-red-600 dark:text-white dark:focus:ring-red-700 dark:enabled:hover:border-red-700 dark:enabled:hover:bg-red-700",
    teal: "border border-teal-300 bg-white text-teal-900 focus:ring-4 focus:ring-teal-300 enabled:hover:bg-teal-100 dark:border-teal-600 dark:bg-teal-600 dark:text-white dark:focus:ring-teal-700 dark:enabled:hover:border-teal-700 dark:enabled:hover:bg-teal-700",
    yellow:
      "border border-yellow-300 bg-white text-yellow-900 focus:ring-4 focus:ring-yellow-300 enabled:hover:bg-yellow-100 dark:border-yellow-600 dark:bg-yellow-600 dark:text-white dark:focus:ring-yellow-700 dark:enabled:hover:border-yellow-700 dark:enabled:hover:bg-yellow-700",
  },
  disabled: "cursor-not-allowed opacity-50",
  isProcessing: "cursor-wait",
  spinnerSlot: "absolute top-0 flex h-full items-center",
  spinnerLeftPosition: {
    xs: "left-2",
    sm: "left-3",
    md: "left-4",
    lg: "left-5",
    xl: "left-6",
  },
  gradient: {
    cyan: "bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 text-white focus:ring-4 focus:ring-cyan-300 enabled:hover:bg-gradient-to-br dark:focus:ring-cyan-800",
    failure:
      "bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white focus:ring-4 focus:ring-red-300 enabled:hover:bg-gradient-to-br dark:focus:ring-red-800",
    info: "bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 text-white focus:ring-4 focus:ring-cyan-300 enabled:hover:bg-gradient-to-br dark:focus:ring-cyan-800",
    lime: "bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 text-gray-900 focus:ring-4 focus:ring-lime-300 enabled:hover:bg-gradient-to-br dark:focus:ring-lime-800",

    pink: "bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white focus:ring-4 focus:ring-pink-300 enabled:hover:bg-gradient-to-br dark:focus:ring-pink-800",
    purple:
      "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white focus:ring-4 focus:ring-purple-300 enabled:hover:bg-gradient-to-br dark:focus:ring-purple-800",
    success:
      "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white focus:ring-4 focus:ring-green-300 enabled:hover:bg-gradient-to-br dark:focus:ring-green-800",
    teal: "bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white focus:ring-4 focus:ring-teal-300 enabled:hover:bg-gradient-to-br dark:focus:ring-teal-800",
  },
  gradientDuoTone: {
    cyanToBlue:
      "bg-gradient-to-r from-cyan-500 to-cyan-500 text-white focus:ring-4 focus:ring-cyan-300 enabled:hover:bg-gradient-to-bl dark:focus:ring-cyan-800",
    greenToBlue:
      "bg-gradient-to-br from-green-400 to-cyan-600 text-white focus:ring-4 focus:ring-green-200 enabled:hover:bg-gradient-to-bl dark:focus:ring-green-800",
    pinkToOrange:
      "bg-gradient-to-br from-pink-500 to-orange-400 text-white focus:ring-4 focus:ring-pink-200 enabled:hover:bg-gradient-to-bl dark:focus:ring-pink-800",
    purpleToBlue:
      "bg-gradient-to-br from-purple-600 to-cyan-500 text-white focus:ring-4 focus:ring-cyan-300 enabled:hover:bg-gradient-to-bl dark:focus:ring-cyan-800",
    purpleToPink:
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white focus:ring-4 focus:ring-purple-200 enabled:hover:bg-gradient-to-l dark:focus:ring-purple-800",
    redToYellow:
      "bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 text-gray-900 focus:ring-4 focus:ring-red-100 enabled:hover:bg-gradient-to-bl dark:focus:ring-red-400",
    tealToLime:
      "bg-gradient-to-r from-teal-200 to-lime-200 text-gray-900 focus:ring-4 focus:ring-lime-200 enabled:hover:bg-gradient-to-l enabled:hover:from-teal-200 enabled:hover:to-lime-200 enabled:hover:text-gray-900 dark:focus:ring-teal-700",
  },
  inner: {
    base: "flex items-stretch transition-all duration-200",
    position: {
      none: "",
      start: "rounded-r-none",
      middle: "rounded-none",
      end: "rounded-l-none",
    },
    outline: "border border-transparent",
    isProcessingPadding: {
      xs: "pl-8",
      sm: "pl-10",
      md: "pl-12",
      lg: "pl-16",
      xl: "pl-20",
    },
  },
  label:
    "ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-cyan-200 text-xs font-semibold text-cyan-800",
  outline: {
    color: {
      gray: "border border-gray-900 dark:border-white",
      default: "border-0",
      light: "",
    },
    off: "",
    on: "flex w-full justify-center bg-white text-gray-900 transition-all duration-75 ease-in group-enabled:group-hover:bg-opacity-0 group-enabled:group-hover:text-inherit dark:bg-gray-900 dark:text-white",
    pill: {
      off: "rounded-md",
      on: "rounded-full",
    },
  },
  pill: {
    off: "rounded-lg",
    on: "rounded-full",
  },
  size: {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
    xl: "px-6 py-3 text-base",
  },
} as const;

const CustomMarker = ({
  position,
  driver,
}: {
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  driver: EntityWithPath<DriverEntity & { user: UserEntity }>;
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  return (
    <>
      <AdvancedMarker position={position} ref={markerRef}>
        <Pin
          background={"#FFAF01"}
          borderColor={"#FF9100"}
          glyphColor={"#FFC400"}
        />
      </AdvancedMarker>
      <InfoWindow
        anchor={marker}
        className="m-0 p-0"
        headerContent={<span>{driver.data.user.displayName}</span>}
      >
        <div className="flex flex-col gap-2">
          <span>{driver.data.user.email}</span>
          <span>{driver.data.user.phoneNumber}</span>
        </div>
      </InfoWindow>
    </>
  );
};

const DriverManagement: React.FC = () => {
  const { fetchDrivers } = useDbOperations();
  const { fetchImage } = useStorageOperations();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentDriver, setCurrentDriver] = useState<EntityWithPath<
    DriverEntity & { user: UserEntity }
  > | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: drivers, isLoading } = useQuery({
    initialData: [],
    refetchInterval: 30000,
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
  });

  const { data: driverLicenseUrl } = useQuery({
    initialData: "",
    enabled: !!currentDriver?.data.driverLicenseFrontStoragePath,
    queryKey: [
      "driverLicenseUrl",
      currentDriver?.data.driverLicenseFrontStoragePath,
    ],
    queryFn: () =>
      fetchImage(currentDriver?.data.driverLicenseFrontStoragePath || ""),
    select(data) {
      return data;
    },
    throwOnError(error, query) {
      console.warn({ ref: "driverLicenseUrl", error, query });
      return false;
    },
  });

  const { data: driverInsuranceUrl } = useQuery({
    initialData: "",
    enabled: !!currentDriver?.data.driverInsuranceStoragePath,
    queryKey: [
      "driverInsuranceUrl",
      currentDriver?.data.driverInsuranceStoragePath,
    ],
    queryFn: () =>
      fetchImage(currentDriver?.data.driverInsuranceStoragePath || ""),
    select(data) {
      return data;
    },
    throwOnError(error, query) {
      console.warn({ ref: "driverInsuranceUrl", error, query });
      return false;
    },
  });

  const queryClient = useQueryClient();
  const { updateDriver: _updateDriver } = useDbOperations();
  const [nextStatusInfo, setNextStatusInfo] = useState<{
    title: string;
    message: string;
    status: VerificationStatus;
    requireExplanation: boolean;
  } | null>(null);

  const [showMessageModal, setShowMessageModal] = useState<
    "group" | "single" | null
  >(null);

  const { mutate: updateDriverStatus, isPending: isUpdateDriverStatusPending } =
    useMutation({
      mutationFn: async (args: {
        path: string;
        status: VerificationStatus;
        ev: React.FormEvent<HTMLFormElement>;
      }) => {
        let statusHint: string | null = null;
        if (args.ev) {
          args.ev.preventDefault();

          // WARNING: args.ev.currentTarget is null for unknown reason that is why we use the target instead.
          const fd = new FormData(args.ev.currentTarget || args.ev.target);
          statusHint = fd.get("statusHint")?.toString() || null;
        }
        console.log("updateDriverStatus2");
        if (
          !currentDriver?.data.user?.uid ||
          currentDriver?.path !== args.path
        ) {
          return {};
        }
        console.log("updateDriverStatu3");
        await _updateDriver(currentDriver.data.user.uid, {
          verificationStatus: args.status,
          verificationMessage: statusHint,
        });

        console.log("updateDriverStatus4");
        return {
          path: args.path,
          status: args.status,
          statusHint,
        };
      },
      onSuccess({ path, status, statusHint }) {
        queryClient.invalidateQueries({ queryKey: ["drivers"] });
        setShowModal(false);
        setNextStatusInfo(null);
        if (currentDriver && currentDriver.path === path) {
          setCurrentDriver({
            ...currentDriver,
            data: {
              ...currentDriver.data,
              verificationStatus: status,
              verificationMessage: statusHint,
            },
          });
        }
      },
      onError(error, variables, context) {
        console.error({ error, variables, context });
      },
    });

  const dispatch = useAppDispatch();
  const serverRequest = useServerRequest();
  const {
    mutate: sendMessageToDriver,
    isPending: isSendMessageToDriverPending,
  } = useMutation({
    mutationFn: async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const fd = new FormData(
        ev.currentTarget || (ev.target as HTMLFormElement),
      );
      const message = fd.get("message")?.toString() || "";
      return serverRequest("/messaging/sms/send-batch-message-to-drivers", {
        method: "POST",
        body: {
          uids: currentDriver?.data.user?.uid
            ? [currentDriver.data.user.uid]
            : filteredDrivers.map((driver) => driver.data.user.uid),
          message,
        } satisfies ApiReqSendBatchMessage,
        schema: type({
          successes: type({
            body: "unknown?",
            numSegments: "unknown?",
            direction: "string",
            from: "string",
            to: "string",
            dateUpdated: "string",
            price: "unknown?",
            errorMessage: "unknown?",
            uri: "string",
            accountSid: "string",
            numMedia: "unknown?",
            status: "string",
            messagingServiceSid: "string | null ?",
            sid: "string",
            dateSent: "string | null ?",
            dateCreated: "string",
            errorCode: "string | null ?",
            priceUnit: "unknown?",
            apiVersion: "unknown?",
            "+": "ignore",
          }).array(),

          failures: type("object[]").optional(),
        }),
      });
    },
    onSuccess(data) {
      const hasError = !!data?.failures?.length;
      const hasSuccess = !!data?.successes?.length;
      if (hasError && !hasSuccess) {
        dispatch(
          showInfoBubble({
            title: "Error",
            message: "Message sent failed",
            type: "failure",
          }),
        );
      } else if (!hasError && hasSuccess) {
        dispatch(
          showInfoBubble({
            title: "Success",
            message: "Message sent successfully",
            type: "success",
          }),
        );
      } else {
        dispatch(
          showInfoBubble({
            title: "Warning",
            message: `Message sent to ${data?.successes?.length} drivers. ${data?.failures?.length} failed.`,
            type: "warning",
          }),
        );
      }
      setShowMessageModal(null);
      setCurrentDriver(null);
    },
    onError(error, variables, context) {
      console.error({ error, variables, context });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" color="purple" />
      </div>
    );
  }
  if (!drivers || drivers.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">No drivers found</p>
      </div>
    );
  }
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.data.user?.displayName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      driver.data.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      getDriverVerificationStatus(driver.data) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderStatusBadge = (status: VerificationStatus | undefined) => {
    switch (status) {
      case "verified":
        return (
          <Badge color="success" icon={HiCheck}>
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge color="warning" icon={HiClock}>
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge color="failure" icon={HiX}>
            Failed
          </Badge>
        );
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary-700">Driver Management</h2>
      <Accordion collapseAll className="w-full border-none">
        <Accordion.Panel className="border-none">
          <Accordion.Title className="border-b-[1px] bg-transparent p-0 text-secondary-950 hover:bg-transparent focus:right-0 focus:bg-transparent focus:ring-transparent [&>h2]:w-full">
            <span className="text-base font-semibold">View On Map</span>
          </Accordion.Title>
          <Accordion.Content className="border-none px-0">
            <Map
              mapId={"DEMO_MAP_ID"}
              style={{ width: "100%", height: "50vh" }}
              defaultZoom={10}
              minZoom={3}
              defaultCenter={{
                lat: 38.9059849,
                lng: -77.03341792,
              }}
              gestureHandling={"greedy"}
              disableDefaultUI={true}
            >
              {drivers?.map((driver) => {
                if (
                  !driver.data.latestLocation ||
                  !driver.data.latestLocation.latitude ||
                  !driver.data.latestLocation.longitude
                ) {
                  return null;
                }
                return (
                  <CustomMarker
                    key={driver.path}
                    position={{
                      lat: driver.data.latestLocation.latitude,
                      lng: driver.data.latestLocation.longitude,
                    }}
                    driver={driver}
                  />
                );
              })}
            </Map>
          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-full sm:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <HiSearch className="h-5 w-5 text-gray-500" />
          </div>
          <TextInput
            type="search"
            placeholder="Search drivers..."
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
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </Select>
        </div>

        <div className="w-full sm:w-64">
          <SecondaryButton
            className="border-secondary-950 bg-secondary-50 p-2 text-secondary-700 "
            onClick={() => setShowMessageModal("group")}
          >
            <TbMessageUser />
          </SecondaryButton>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm">
        <Table striped>
          <Table.Head>
            <Table.HeadCell className="flex items-center justify-center gap-2">
              {/* {multiSelectMode && (
                <TextInput className="max-w-2 border-2 p-2" type="checkbox" />
              )}
              {multiSelectMode ? (
                <SecondaryButton
                  className="m-1 inline border-none bg-orange-50 p-1 text-orange-700 "
                  onClick={() => setMultiSelectMode(false)}
                >
                  <ImCancelCircle size={18} className="inline" />
                </SecondaryButton>
              ) : (
                <SecondaryButton
                  className="inline border-none bg-secondary-50 p-2 text-secondary-700 "
                  onClick={() => setMultiSelectMode(true)}
                >
                  <MdLibraryAddCheck size={18} className="inline" />
                </SecondaryButton>
              )} */}
              Actions
            </Table.HeadCell>
            <Table.HeadCell>Driver</Table.HeadCell>
            <Table.HeadCell>Verification Status</Table.HeadCell>
            <Table.HeadCell>Vehicles</Table.HeadCell>
            <Table.HeadCell>Earnings</Table.HeadCell>
            <Table.HeadCell>Tasks</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredDrivers.map((driver) => (
              <Table.Row key={driver.data.user?.uid}>
                <Table.Cell className="flex items-center gap-2">
                  {driver.data.phoneNumber && (
                    <SecondaryButton
                      className="border-none bg-secondary-50 p-1 text-2xl text-secondary-700 "
                      onClick={() => {
                        setCurrentDriver({ ...driver });
                        setShowMessageModal("single");
                      }}
                    >
                      <FaSms />
                    </SecondaryButton>
                  )}
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => {
                      setCurrentDriver({ ...driver });
                      setShowModal(true);
                    }}
                  >
                    <u>View Details</u>
                  </Button>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      img={
                        driver.data.user?.photoURL ||
                        "https://via.placeholder.com/40"
                      }
                      rounded
                      size="sm"
                    />
                    <div>
                      <div>{driver.data.user?.displayName}</div>
                      <div className="text-xs text-gray-500">
                        {driver.data.user?.email}
                      </div>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {renderStatusBadge(getDriverVerificationStatus(driver.data))}
                </Table.Cell>
                <Table.Cell>
                  {driver.data.vehicles ? driver.data.vehicles.length : 0}{" "}
                  vehicles
                </Table.Cell>
                <Table.Cell>
                  <div>{formatPrice(driver.data.totalEarnings || 0)}</div>
                  <div className="text-xs text-gray-500">
                    {formatPrice(driver.data.currentEarnings || 0)} current
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div>{driver.data.tasksCompleted || 0} completed</div>
                  <div className="text-xs text-gray-500">
                    {driver.data.activeTasks || 0} active
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Driver Details Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setCurrentDriver(null);
        }}
        size="5xl"
        // className=" bg-black bg-opacity-30 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
      >
        <Modal.Header>Driver Details</Modal.Header>
        <Modal.Body className="max-h-[70vh] overflow-y-auto p-4">
          {currentDriver && (
            <div>
              <div className="mb-6 flex flex-col items-start gap-6 md:flex-row">
                <div className="w-full md:w-1/3">
                  <div className="mb-4 flex items-center gap-4">
                    <Avatar
                      img={
                        currentDriver.data.user?.photoURL ||
                        "https://via.placeholder.com/80"
                      }
                      size="lg"
                      rounded
                    />
                    <div>
                      <h3 className="text-xl font-bold">
                        {currentDriver.data.user?.displayName}
                      </h3>
                      <div className="mt-1 flex items-center">
                        {renderStatusBadge(
                          getDriverVerificationStatus(currentDriver.data),
                        )}
                      </div>
                    </div>
                  </div>

                  <Card>
                    <h4 className="mb-4 text-lg font-semibold">
                      Contact Information
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <HiMail className="text-gray-500" />
                        <span>
                          {currentDriver.data.user?.email || "No email"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <HiPhone className="text-gray-500" />
                        <span>
                          {currentDriver.data.user?.phoneNumber ||
                            "No phone number"}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <HiLocationMarker className="mt-1 text-gray-500" />
                        <span>
                          {currentDriver.data.location?.address || "No address"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="w-full md:w-2/3">
                  <Tabs theme={tabTheme} variant="underline">
                    <Tabs.Item
                      title={
                        <div className="flex items-center gap-2">
                          <HiIdentification />
                          <span>Documents</span>
                        </div>
                      }
                      active
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Card>
                          <h5 className="text-md mb-2 font-semibold">
                            Driver License
                          </h5>
                          <div className="mb-2 flex aspect-[4/3] items-center justify-center bg-gray-100">
                            <AppImage
                              fallback={<MdHideImage className="h-8 w-8" />}
                              src={driverLicenseUrl}
                              alt="driver license"
                              className="max-h-full w-auto rounded-md object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">
                                Status:{" "}
                                {renderStatusBadge(
                                  currentDriver.data
                                    .driverLicenseVerificationStatus ||
                                    "failed",
                                )}
                              </p>
                            </div>
                          </div>
                        </Card>

                        <Card>
                          <h5 className="text-md mb-2 font-semibold">
                            Driver Insurance
                          </h5>
                          <div className="mb-2 flex aspect-[4/3] items-center justify-center bg-gray-100">
                            <AppImage
                              fallback={<MdHideImage className="h-8 w-8" />}
                              src={driverInsuranceUrl}
                              alt="driver insurance"
                              className="max-h-full w-auto rounded-md object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">
                                Status:{" "}
                                {renderStatusBadge(
                                  currentDriver.data
                                    .driverInsuranceVerificationStatus,
                                )}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </Tabs.Item>

                    <Tabs.Item
                      title={
                        <div className="flex items-center gap-2">
                          <HiTruck />
                          <span>
                            Vehicles ({currentDriver.data.vehicles?.length || 0}
                            )
                          </span>
                        </div>
                      }
                    >
                      {currentDriver.data.vehicles &&
                      currentDriver.data.vehicles.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {currentDriver.data.vehicles.map((vehicle, index) => (
                            <Card key={index}>
                              <div className="flex flex-col gap-4 md:flex-row">
                                <div className="w-full md:w-1/3">
                                  <h5 className="text-lg font-semibold">
                                    {vehicle.type}
                                  </h5>
                                  <div className="mt-2">
                                    <Badge color="gray">{vehicle.type}</Badge>
                                  </div>
                                </div>

                                {vehicle.insuranceStoragePath && (
                                  <div className="w-full md:w-2/3">
                                    <h6 className="font-semibold">
                                      Vehicle Insurance
                                    </h6>
                                    <div className="mt-2 flex items-center gap-2">
                                      <HiDocumentText className="text-gray-500" />
                                      <span>
                                        Status:{" "}
                                        {renderStatusBadge(
                                          vehicle.insuranceVerificationStatus,
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-gray-500">
                          No vehicles registered
                        </div>
                      )}
                    </Tabs.Item>
                  </Tabs>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-4 text-lg font-semibold">
                  Update Verification Status
                </h4>

                <div className="flex gap-2 text-primary-700">
                  <Button
                    theme={btTheme}
                    color="success"
                    // disabled={
                    //   getDriverVerificationStatus(currentDriver.data) ===
                    //   "verified"
                    // }
                    onClick={() =>
                      setNextStatusInfo({
                        status: "verified",
                        title: "Confirm Action",
                        message:
                          "This action will change the status of the driver to verified",
                        requireExplanation: false,
                      })
                    }
                  >
                    <HiCheck className="mr-2" /> Approve Driver
                  </Button>

                  <Button
                    color="failure"
                    // disabled={
                    //   getDriverVerificationStatus(currentDriver.data) ===
                    //   "failed"
                    // }
                    onClick={() =>
                      setNextStatusInfo({
                        status: "failed",
                        title: "Confirm Action",
                        message:
                          "This action will change the status of the driver to failed." +
                          "\n\n" +
                          "Note: If the driver has assigned or pending orders, he will still be able to complete them.",
                        requireExplanation: true,
                      })
                    }
                  >
                    <HiX className="mr-2" /> Reject Driver
                  </Button>
                  {nextStatusInfo && (
                    <Modal
                      size="sm"
                      // className=" bg-black bg-opacity-70 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
                      show={!!nextStatusInfo}
                      onClose={() => setNextStatusInfo(null)}
                    >
                      <Modal.Header className="[&>button]:rounded-full [&>button]:bg-accent-400 [&>button]:p-[1px] [&>button]:text-primary-100 [&>button]:transition-all  [&>button]:duration-300  hover:[&>button]:scale-110 hover:[&>button]:text-primary-950 ">
                        <span className="text-lg font-medium">
                          {nextStatusInfo.title}
                        </span>
                      </Modal.Header>
                      <Modal.Body className="text-secondary-950">
                        <p className="mb-4">{nextStatusInfo.message}</p>
                        <form
                          onSubmit={(ev) =>
                            updateDriverStatus({
                              path: currentDriver?.path,
                              status: nextStatusInfo.status,
                              ev,
                            })
                          }
                          className="flex flex-col gap-8"
                        >
                          {nextStatusInfo.requireExplanation && (
                            <label className="text-sm">
                              Explanation
                              <TextInput
                                autoCorrect="true"
                                name="statusHint"
                                type="text"
                                autoFocus
                                placeholder="Please Provide Your Reasons"
                                minLength={10}
                                required
                              />
                            </label>
                          )}
                          <SecondaryButton
                            type="submit"
                            isLoading={isUpdateDriverStatusPending}
                            className="self-end border-teal-500 bg-teal-200 py-2 text-secondary-950"
                          >
                            Confirm
                          </SecondaryButton>
                        </form>
                      </Modal.Body>
                    </Modal>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        size="sm"
        show={!!showMessageModal}
        onClose={() => setShowMessageModal(null)}
      >
        <Modal.Header className="[&>button]:rounded-full [&>button]:bg-accent-400 [&>button]:p-[1px] [&>button]:text-primary-100 [&>button]:transition-all  [&>button]:duration-300  hover:[&>button]:scale-110 hover:[&>button]:text-primary-950 ">
          <span className="text-lg font-medium">Message Driver</span>
        </Modal.Header>
        <Modal.Body className="text-secondary-950">
          <p className="mb-4">
            You are about to send{" "}
            {showMessageModal === "single" ? "a" : "a group"} message to{" "}
            {showMessageModal === "group"
              ? filteredDrivers.length + " drivers"
              : (currentDriver?.data.displayName ||
                  currentDriver?.data.firstName +
                    " " +
                    currentDriver?.data.lastName) +
                " " +
                currentDriver?.data.phoneNumber}
          </p>
          <form onSubmit={sendMessageToDriver} className="flex flex-col gap-8">
            <label className="text-sm">
              <TextArea
                autoCorrect="true"
                name="message"
                autoFocus
                rows={3}
                placeholder="Please Provide Your Message"
                minLength={5}
                required
              />
            </label>
            <SecondaryButton
              type="submit"
              isLoading={isSendMessageToDriverPending}
              className="self-end border-teal-500 bg-teal-200 py-2 text-secondary-950"
            >
              Send Message
            </SecondaryButton>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DriverManagement;
