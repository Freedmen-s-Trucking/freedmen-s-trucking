import {
  ApiReqScheduleDeliveryIntent,
  ApiResExtractOrderRequestFromText,
  apiResExtractOrderRequestFromText,
  DistanceMeasurement,
  LATEST_PLATFORM_SETTINGS_PATH,
  Location,
  OrderPriority,
  PlaceLocation,
  PlatformSettingsEntity,
  ProductWithQuantity,
  RequiredVehicleEntity,
} from "@freedmen-s-trucking/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { add, formatDuration, intervalToDuration } from "date-fns";
import { Dropdown, Modal, Tabs } from "flowbite-react";
import { motion } from "motion/react";
import React, { useCallback, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import {
  AddressSearchInput,
  Heading2,
  OnAddressChangedParams,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from "~/components/atoms";
import StripePayment from "~/components/molecules/stripe-payment";
import { useAuth } from "~/hooks/use-auth";
import { useDbOperations } from "~/hooks/use-firestore";
import {
  fetchPlaceDetails,
  fetchPlacesFromGoogle,
} from "~/hooks/use-geocoding";
import { useComputeDeliveryEstimation } from "~/hooks/use-price-calculator";
import { useGetRemoteConfig } from "~/hooks/use-remote-config";
import { useServerRequest } from "~/hooks/use-server-request";
import { setRequestedAuthAction } from "~/stores/controllers/app-ctrl";
import { useAppDispatch } from "~/stores/hooks";
import { RemoteConfigKeys } from "~/utils/constants";
import { formatPrice } from "~/utils/functions";
import { TextArea } from "../atoms/base";

const tabTheme = {
  tablist: {
    // className="focus:[&>button]: focus:[&>button]:ring-secondary-800"
    tabitem: {
      variant: {
        underline: {
          base: "rounded-t-lg focus:outline-transparent focus:ring-transparent",
          active: {
            on: "active rounded-t-lg border-b-2 border-primary-700 text-primary-700",
            off: "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600",
          },
        },
      },
    },
  },
};

const OrderPriorities = [
  {
    label: "Standard",
    value: OrderPriority.STANDARD,
  },
  {
    label: "Expedited",
    value: OrderPriority.EXPEDITED,
  },
  {
    label: "Urgent",
    value: OrderPriority.URGENT,
  },
] as const;
export const CreateOrder: React.FC<{
  showInModal?: { onClose: () => void };
  brightness: "dark" | "light";
  onComplete?: () => void;
}> = ({ showInModal, brightness, onComplete }) => {
  const [showModal, setShowModal] = useState(!!showInModal);
  const onCloseModal = () => {
    setShowModal(false);
    showInModal?.onClose?.();
  };
  if (showInModal) {
    return (
      <Modal show={showModal} onClose={onCloseModal} size={"lg"}>
        <Modal.Header>
          <span className="text-lg font-medium">Schedule Delivery</span>
        </Modal.Header>
        <Modal.Body className="max-h-[80vh] overflow-y-auto p-4">
          <CreateOrderForm
            brightness={brightness}
            className="border-none"
            onOrderCreated={onComplete}
          />
        </Modal.Body>
      </Modal>
    );
  }
  return (
    <CreateOrderForm brightness={brightness} onOrderCreated={onComplete} />
  );
};

const ManualForm: React.FC<{
  brightness: "dark" | "light";
  className?: string;
  onOrderCreated?: () => void;
}> = ({ brightness, className, onOrderCreated }) => {
  const [deliveryPriority, setDeliveryPriorityInput] =
    useState<(typeof OrderPriorities)[number]>();
  const [error, setError] = useState<string | null>(null);

  const [packages, setPackages] = useState<ProductWithQuantity[]>([]);

  const [pickupLocation, setPickupLocation] = useState<PlaceLocation | null>(
    null,
  );

  const { fetchPlatformSettings } = useDbOperations();

  const { data: platformSettings } = useQuery({
    initialData: null,
    queryKey: [LATEST_PLATFORM_SETTINGS_PATH],
    queryFn: fetchPlatformSettings,
    select: (result) => {
      return (
        result?.data || ({ availableCities: [] } as PlatformSettingsEntity)
      );
    },
  });

  const [deliveryLocation, setDeliveryLocation] =
    useState<PlaceLocation | null>(null);

  const onPickupLocationChanged = (params: OnAddressChangedParams) => {
    console.log({ onPickupLocationChanged: params });
    setPickupLocation(params.place);
  };

  const onDeliveryPriorityChanged = (
    params: (typeof OrderPriorities)[number],
  ) => {
    console.log({ onDeliveryPriorityChanged: params });
    setDeliveryPriorityInput(params);
  };

  const onDeliveryLocationChanged = (params: OnAddressChangedParams) => {
    console.log({ onDeliveryLocationChanged: params });
    setDeliveryLocation(params.place);
  };

  const {
    result: estimations,
    isFetching: isEstimationLoading,
    error: estimationError,
  } = useComputeDeliveryEstimation({
    pickupLocation: pickupLocation || undefined,
    deliveryLocation: deliveryLocation || undefined,
    priority: deliveryPriority?.value || undefined,
    products: packages,
  });

  const handlePackageChange =
    (index: number) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = event.target;

      setPackages((previousPackages) => {
        const newPackages = [...previousPackages];
        if (
          name === "estimatedDimensions.heightInInches" ||
          name === "estimatedDimensions.widthInInches" ||
          name === "estimatedDimensions.lengthInInches"
        ) {
          const dimensionName = name.split(".")[1];
          newPackages[index] = {
            ...newPackages[index],
            estimatedDimensions: {
              ...newPackages[index].estimatedDimensions,
              [dimensionName]:
                value && type === "number" ? parseFloat(value) : value,
            },
          };
        } else {
          newPackages[index] = {
            ...newPackages[index],
            [name]: value && type === "number" ? parseFloat(value) : value,
          };
        }
        return newPackages;
      });
    };

  const handleAddPackage = () => {
    setPackages((previousPackages) => [
      ...previousPackages,
      {
        name: "",
        estimatedDimensions: {
          heightInInches: 0,
          widthInInches: 0,
          lengthInInches: 0,
        },
        estimatedWeightInLbsPerUnit: 0,
        quantity: 1,
      },
    ]);
  };

  const getValidationErrorMessage = () => {
    if (!pickupLocation) {
      return "Pickup location is required";
    }
    if (!deliveryLocation) {
      return "Delivery location is required";
    }
    if (!deliveryPriority) {
      return "Priority is required";
    }
    if (!packages?.length) {
      return "Add at least one package";
    }
    return null;
  };
  const validateForm = () => {
    const errorMessage = getValidationErrorMessage();
    if (errorMessage) {
      setError(errorMessage);
      return errorMessage;
    }
    setError(null);
    return null;
  };

  const handleComputeEstimation = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationResult = validateForm();
    if (validationResult) {
      return;
    }
    if (!estimations) {
      setError(`Failed to compute estimation: ${estimationError?.message}`);
      return;
    }
    setError(null);
  };

  const handleRemovePackage = (index: number) => () => {
    setPackages((previousPackages) =>
      previousPackages.filter((_, i) => i !== index),
    );
  };

  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-3xl border p-8 ${brightness === "dark" ? "border-white bg-white/20" : ""} ${className}`}
    >
      <form
        className="flex flex-col items-center gap-4"
        onSubmit={handleComputeEstimation}
        onChange={validateForm}
      >
        <AddressSearchInput
          onAddressChanged={onPickupLocationChanged}
          required
          restrictedGMARecBounds={platformSettings?.availableCities?.map(
            (city) => city.viewPort,
          )}
          id="pickup-location-input"
          maxLength={250}
          className={`block w-full rounded-xl border p-3 text-center text-sm text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
          placeholder="Enter pickup location"
        />
        <AddressSearchInput
          onAddressChanged={onDeliveryLocationChanged}
          required
          restrictedGMARecBounds={platformSettings?.availableCities?.map(
            (city) => city.viewPort,
          )}
          id="enter-delivery-input"
          maxLength={250}
          className={`block w-full rounded-xl border p-3 text-center text-sm text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
          placeholder="Enter delivery location"
        />
        <Dropdown
          label=""
          className="-mt-4 rounded-b-lg rounded-t-none bg-primary-50 shadow-md shadow-primary-700"
          trigger="click"
          renderTrigger={() => (
            <TextInput
              spellCheck
              minLength={10}
              readOnly
              value={deliveryPriority?.label || ""}
              id="delivery-type-input"
              className={`block w-full cursor-pointer rounded-xl border p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
              placeholder="Priority >"
            />
          )}
        >
          {OrderPriorities.map((props) => (
            <Dropdown.Item
              key={props.label}
              onClick={() => onDeliveryPriorityChanged(props)}
              className="hover:bg-primary-100"
            >
              {props.label}
            </Dropdown.Item>
          ))}
        </Dropdown>
        <div className="flex max-h-[400px] w-full flex-col gap-4 overflow-y-auto py-2">
          {packages.map((packageProps, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-between gap-4 rounded-xl border p-2 ${brightness === "dark" ? "border-gray-300" : ""}`}
            >
              <TextInput
                required
                type="text"
                name="name"
                id={`package-name-input-${index}`}
                value={packageProps.name}
                onChange={handlePackageChange(index)}
                className={`block w-full rounded-xl border p-3 text-center text-lg text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                placeholder="Enter package name"
              />
              <div className="flex flex-row items-center gap-2">
                <label className="flex flex-col items-center gap-1">
                  <span>Quantity</span>
                  <TextInput
                    required
                    type="number"
                    min={1}
                    step={1}
                    name="quantity"
                    id={`package-quantity-input-${index}`}
                    value={`${packageProps.quantity}`}
                    onChange={handlePackageChange(index)}
                    className={`block w-full rounded-xl border p-3 text-center text-lg text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                    placeholder="Quantity"
                  />
                </label>
                <label className="flex flex-col items-center gap-1">
                  <span>Weight (lbs)</span>
                  <TextInput
                    required
                    type="number"
                    min={1}
                    step={0.01}
                    name="estimatedWeightInLbsPerUnit"
                    id={`package-weight-input-${index}`}
                    value={`${packageProps.estimatedWeightInLbsPerUnit}`}
                    onChange={handlePackageChange(index)}
                    className={`block w-full rounded-xl border p-3 text-center text-lg text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                    placeholder="Weight (lbs)"
                  />
                </label>
              </div>
              <div className="flex flex-row items-center justify-between gap-2">
                <label className="flex flex-col items-center gap-1">
                  <span>Height (in)</span>
                  <TextInput
                    required
                    type="number"
                    min={1}
                    step={0.01}
                    name="estimatedDimensions.heightInInches"
                    id={`package-height-input-${index}`}
                    value={`${packageProps.estimatedDimensions.heightInInches}`}
                    onChange={handlePackageChange(index)}
                    className={`block w-full rounded-xl border p-3 text-center text-lg text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                    placeholder="Height (in)"
                  />
                </label>
                <label className="flex flex-col items-center gap-1">
                  <span>Width (in)</span>
                  <TextInput
                    required
                    type="number"
                    min={1}
                    step={0.01}
                    name="estimatedDimensions.widthInInches"
                    id={`package-width-input-${index}`}
                    value={`${packageProps.estimatedDimensions.widthInInches}`}
                    onChange={handlePackageChange(index)}
                    className={`block w-full rounded-xl border p-3 text-center text-lg text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                    placeholder="Width (in)"
                  />
                </label>
                <label className="flex flex-col items-center gap-1">
                  <span>Length (in)</span>
                  <TextInput
                    required
                    type="number"
                    min={1}
                    step={0.01}
                    name="estimatedDimensions.lengthInInches"
                    id={`package-length-input-${index}`}
                    value={`${packageProps.estimatedDimensions.lengthInInches}`}
                    onChange={handlePackageChange(index)}
                    className={`block w-full rounded-xl border p-3 text-center text-lg text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                    placeholder="Length (in)"
                  />
                </label>
              </div>
              <button
                className={`rounded-xl bg-transparent p-1  transition-all duration-100 hover:text-red-600 ${brightness === "dark" ? "text-white hover:bg-gray-200 " : "hover:bg-gray-200"}`}
                onClick={handleRemovePackage(index)}
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <SecondaryButton
            className={`self-center rounded-xl border bg-transparent px-4 py-2 transition-all duration-100  hover:text-secondary-900 ${brightness === "dark" ? "text-white" : "text-secondary-900"}`}
            onClick={handleAddPackage}
          >
            Add Package
          </SecondaryButton>
        </div>
        <div
          className={`block w-full text-wrap rounded-xl border  p-3 text-sm  focus:outline-none focus:ring-transparent sm:text-[16px] ${brightness === "dark" ? "border-gray-300 bg-amber-400/30 text-white focus:border-red-400" : "border-gray-300 bg-amber-200/30 text-secondary-900 focus:border-red-900"}`}
        >
          <span className="block">
            Required Vehicle Type:{" "}
            {estimations?.vehicles
              ?.map((v) => `${v.quantity}*${v.type}`)
              .join(", ") || "N/A"}
          </span>
          <span className="block">
            Estimated Delivery Cost:{" "}
            {estimations?.fees !== undefined
              ? formatPrice(estimations.fees)
              : "N/A"}
          </span>
          <span className="block">
            Estimated Delivery Time:{" "}
            {estimations?.durationInSeconds
              ? formatDuration(
                  intervalToDuration({
                    start: new Date(0),
                    end: add(new Date(0), {
                      seconds: estimations.durationInSeconds,
                    }),
                  }),
                  { zero: true, format: ["hours", "minutes", "seconds"] },
                )
              : "N/A"}
          </span>
          <span className="block">
            Estimated Distance:{" "}
            {estimations?.distanceInMiles !== undefined
              ? `${estimations.distanceInMiles.toFixed(3)} miles`
              : "N/A"}
          </span>
        </div>
        <motion.div
          initial={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
          animate={{
            opacity: 1,
            scaleY: 1,
            scaleX: 1,
            transition: { duration: 0.2, type: "spring", stiffness: 300 },
          }}
          className={`inline-block w-full rounded-lg p-1 text-center text-red-500 transition-all duration-500 ${error ? "" : "hidden"} ${brightness === "dark" ? "bg-white " : ""}`}
        >
          {error}
        </motion.div>
        <PaymentButton
          isLoading={isEstimationLoading}
          pickupLocation={pickupLocation}
          deliveryLocation={deliveryLocation}
          deliveryPriority={deliveryPriority?.value || null}
          packages={packages}
          disabled={!!error}
          onOrderCreated={onOrderCreated}
          estimations={estimations || null}
        />
      </form>
    </div>
  );
};

const PaymentButton: React.FC<{
  isLoading: boolean;
  onOrderCreated?: () => void;
  pickupLocation: Location | null;
  deliveryLocation: Location | null;
  deliveryPriority: OrderPriority | null;
  packages: ProductWithQuantity[];
  disabled: boolean;
  estimations: {
    distanceInMiles?: number | undefined;
    durationInSeconds?: number | undefined;
    distanceMeasurement?: DistanceMeasurement | undefined;
    vehicles: RequiredVehicleEntity[];
    fees: number;
  } | null;
}> = ({
  isLoading,
  onOrderCreated,
  estimations,
  disabled,
  pickupLocation,
  deliveryLocation,
  deliveryPriority,
  packages,
}) => {
  const { user } = useAuth();
  const [isScheduling, setIsScheduling] = useState(false);
  const [processPayment, setProcessPayment] = useState<
    ApiReqScheduleDeliveryIntent["metadata"] | null
  >(null);

  const onPaymentComplete = () => {
    setProcessPayment(null);
    if (onOrderCreated) {
      onOrderCreated();
    }
  };
  const dispatch = useAppDispatch();
  const requestSignIn = useCallback(
    () =>
      dispatch(
        setRequestedAuthAction({ type: "login", targetAccount: "customer" }),
      ),
    [dispatch],
  );

  const handleScheduleDelivery = useCallback(async () => {
    console.log("handleScheduleDelivery");
    if (isScheduling) {
      return;
    }
    if (
      !pickupLocation ||
      !deliveryLocation ||
      !deliveryPriority ||
      !packages?.length ||
      !estimations
    ) {
      return;
    }
    if (!user || user.isAnonymous) {
      requestSignIn();
      return;
    }
    setIsScheduling(true);
    try {
      setProcessPayment({
        distanceInMiles: estimations.distanceInMiles || 0,
        distanceMeasurement: estimations.distanceMeasurement!,
        pickupLocation: {
          address: pickupLocation?.address || "",
          latitude: +pickupLocation.latitude || 0,
          longitude: +pickupLocation.longitude || 0,
        },
        deliveryLocation: {
          address: deliveryLocation?.address || "",
          latitude: +deliveryLocation.latitude || 0,
          longitude: +deliveryLocation.longitude || 0,
        },
        products: packages,
        priority: deliveryPriority || "standard",
        priceInUSD: +estimations.fees,
        requiredVehicles: estimations.vehicles,
      });
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsScheduling(false);
    }
  }, [
    pickupLocation,
    deliveryLocation,
    user,
    requestSignIn,
    deliveryPriority,
    packages,
    estimations,
    isScheduling,
  ]);

  const validEstimations =
    estimations?.fees !== undefined &&
    estimations?.vehicles?.length > 0 &&
    estimations?.distanceInMiles !== undefined &&
    estimations?.durationInSeconds !== undefined;

  if (!user || user.isAnonymous) {
    return (
      <PrimaryButton onClick={requestSignIn}>Sign In To Continue</PrimaryButton>
    );
  }
  return (
    <>
      {estimations && processPayment && (
        <StripePayment
          showInModal
          price={estimations.fees}
          order={processPayment}
          onComplete={onPaymentComplete}
        />
      )}
      <PrimaryButton
        disabled={disabled}
        type={validEstimations ? "button" : "submit"}
        onClick={validEstimations ? handleScheduleDelivery : undefined}
        isLoading={isLoading || isScheduling}
      >
        {isScheduling || isLoading
          ? "Scheduling..."
          : estimations?.fees
            ? `Schedule Now For ${formatPrice(estimations.fees)}`
            : "Estimate Delivery"}
      </PrimaryButton>
    </>
  );
};

const AIAssistedForm: React.FC<{
  brightness: "dark" | "light";
  className?: string;
  onOrderCreated?: () => void;
}> = ({ brightness, className, onOrderCreated }) => {
  const { fetchPlatformSettings } = useDbOperations();

  const { data: availableCities } = useQuery({
    initialData: null,
    queryKey: [LATEST_PLATFORM_SETTINGS_PATH],
    queryFn: fetchPlatformSettings,
    select: (result) => {
      return (
        (
          result?.data || ({ availableCities: [] } as PlatformSettingsEntity)
        ).availableCities?.map((city) => city.viewPort) || []
      );
    },
  });

  type RequestInfo = Partial<
    Omit<
      ApiResExtractOrderRequestFromText,
      "pickupLocation" | "dropoffLocation"
    >
  > & {
    pickupLocation?: Location;
    dropoffLocation?: Location;
  };
  const [reqInfo, setReqInfo] = useState<RequestInfo>({});

  const serverRequest = useServerRequest();
  const { mutate: autoDetectRequestAndEstimateFees, isPending } = useMutation({
    mutationKey: ["auto-detect-request-and-estimate-fees", availableCities],
    mutationFn: async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      // WARNING: e.currentTarget is null for unknown reason that is why we use the target instead.
      const formData = new FormData(ev.currentTarget || ev.target);
      const requestDAO: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        requestDAO[key] = value;
      });

      const res = await serverRequest("/v1/ai-agent/extract-order-request", {
        method: "POST",
        body: requestDAO,
        schema: apiResExtractOrderRequestFromText,
      });

      const pickupLocationsSuggestions = await fetchPlacesFromGoogle(
        res.pickupLocation,
        {
          viewPort: availableCities[0],
        },
      );
      const rowPickupLocation = pickupLocationsSuggestions.suggestions?.[0];
      if (!rowPickupLocation) {
        throw new Error(`Pickup location not found for ${res.pickupLocation}`);
      }
      const pickupLocation = await fetchPlaceDetails({
        placeId: rowPickupLocation.placePrediction.placeId,
        address: rowPickupLocation.placePrediction.text.text,
      });

      const dropoffLocationsSuggestions = await fetchPlacesFromGoogle(
        res.dropoffLocation,
        {
          viewPort: availableCities[0],
        },
      );
      const rowDropoffLocation = dropoffLocationsSuggestions.suggestions?.[0];
      if (!rowDropoffLocation) {
        throw new Error(
          `Dropoff location not found for ${res.dropoffLocation}`,
        );
      }
      const dropoffLocation = await fetchPlaceDetails({
        placeId: rowDropoffLocation.placePrediction.placeId,
        address: rowDropoffLocation.placePrediction.text.text,
      });

      return {
        ...res,
        pickupLocation,
        dropoffLocation,
      };
    },
    onSuccess(data, variables, context) {
      console.log({ data, variables, context });
      setReqInfo(data);
    },
    onError(error, variables, context) {
      console.error({ error, variables, context });
    },
  });

  const {
    error,
    isFetching,
    result: estimations,
  } = useComputeDeliveryEstimation({
    products: reqInfo.items,
    deliveryLocation: reqInfo.dropoffLocation,
    pickupLocation: reqInfo.pickupLocation,
    priority: reqInfo.urgencyLevel,
  });

  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-3xl border pb-8 ${brightness === "dark" ? "border-white bg-white/20" : ""} ${className}`}
    >
      <form
        onSubmit={autoDetectRequestAndEstimateFees}
        className="flex flex-col items-center gap-4"
      >
        <Heading2 className="text-center font-serif">
          Describe What You Need Delivered - We'll Handle The Rest
        </Heading2>
        <TextArea
          name="text"
          required
          className={`word-spacing-tight block h-11 w-full rounded-xl border p-[8px] text-xs tracking-tight text-black placeholder:text-xs focus:border-red-400 focus:outline-none focus:ring-transparent md:h-auto md:w-11/12 ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
          placeholder="e.g. 4 tires from Waldorf to Baltimore - need by 3PM"
        />
        {/* <PrimaryButton
          type="submit"
          className="py-2"
          loadingIcon=
        >
          Estimate Delivery
        </PrimaryButton> */}
        {estimations && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`block w-full text-wrap rounded-xl border  p-3 text-sm  focus:outline-none focus:ring-transparent sm:text-[16px] ${brightness === "dark" ? "border-gray-300 bg-amber-400/30 text-white focus:border-red-400" : "border-gray-300 bg-amber-200/30 text-secondary-900 focus:border-red-900"}`}
          >
            <span className="block"> Priority: {reqInfo.urgencyLevel}</span>
            <span className="block">
              Pickup Location: {reqInfo.pickupLocation?.address}
            </span>
            <span className="block">
              Dropoff Location: {reqInfo.dropoffLocation?.address}
            </span>
            <span className="block">
              Required Vehicle Type:{" "}
              {estimations?.vehicles
                ?.map((v) => `${v.quantity}*${v.type}`)
                .join(", ") || "N/A"}
            </span>
            <span className="block">
              Estimated Delivery Cost:{" "}
              {estimations?.fees !== undefined
                ? formatPrice(estimations.fees)
                : "N/A"}
            </span>
            <span className="block">
              Estimated Delivery Time:{" "}
              {estimations?.durationInSeconds
                ? formatDuration(
                    intervalToDuration({
                      start: new Date(0),
                      end: add(new Date(0), {
                        seconds: estimations.durationInSeconds,
                      }),
                    }),
                    { zero: true, format: ["hours", "minutes", "seconds"] },
                  )
                : "N/A"}
            </span>
            <span className="block">
              Estimated Distance:{" "}
              {estimations?.distanceInMiles !== undefined
                ? `${estimations.distanceInMiles.toFixed(3)} miles`
                : "N/A"}
            </span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
            animate={{
              opacity: 1,
              scaleY: 1,
              scaleX: 1,
              transition: { duration: 0.2, type: "spring", stiffness: 300 },
            }}
            className={`inline-block w-full rounded-lg p-1 text-center text-red-500 transition-all duration-500 ${error ? "" : "hidden"} ${brightness === "dark" ? "bg-white " : ""}`}
          >
            {error.message}
          </motion.div>
        )}
      </form>
      {(isPending || isFetching) && !estimations && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex w-full flex-row items-center justify-evenly gap-2"
          transition={{ type: "spring", stiffness: 100 }}
        >
          <span className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-primary-100/10 border-t-primary-900" />
        </motion.div>
      )}
      {estimations && (
        <PaymentButton
          disabled={!!error}
          isLoading={isPending || isFetching}
          estimations={estimations || null}
          pickupLocation={reqInfo.pickupLocation || null}
          deliveryLocation={reqInfo.dropoffLocation || null}
          deliveryPriority={reqInfo.urgencyLevel || null}
          packages={reqInfo.items || []}
          onOrderCreated={onOrderCreated}
        />
      )}
    </div>
  );
};

const MultipleForms: React.FC<{
  brightness: "dark" | "light";
  className?: string;
  onOrderCreated?: () => void;
}> = ({ brightness, className, onOrderCreated }) => {
  return (
    <Tabs theme={tabTheme} variant="underline">
      <Tabs.Item title="Manual" active>
        <ManualForm
          brightness={brightness}
          className={className}
          onOrderCreated={onOrderCreated}
        />
      </Tabs.Item>
      <Tabs.Item title="AI Assisted">
        <AIAssistedForm
          brightness={brightness}
          className={className}
          onOrderCreated={onOrderCreated}
        />
      </Tabs.Item>
    </Tabs>
  );
};

export const CreateOrderForm: React.FC<{
  brightness: "dark" | "light";
  className?: string;
  onOrderCreated?: () => void;
}> = ({ brightness, className, onOrderCreated }) => {
  const orderFormType = useGetRemoteConfig(RemoteConfigKeys.order_form_type);

  switch (orderFormType) {
    case "ai-assisted":
      return (
        <AIAssistedForm
          brightness={brightness}
          className={className}
          onOrderCreated={onOrderCreated}
        />
      );
    case "multiple":
      return (
        <MultipleForms
          brightness={brightness}
          className={className}
          onOrderCreated={onOrderCreated}
        />
      );
    case "manual":
    default:
      return (
        <ManualForm
          brightness={brightness}
          className={className}
          onOrderCreated={onOrderCreated}
        />
      );
  }
};
