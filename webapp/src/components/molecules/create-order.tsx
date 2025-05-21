import {
  DEFAULT_PLATFORM_SETTINGS,
  LATEST_PLATFORM_SETTINGS_PATH,
  OrderPriority,
  PlaceLocation,
  ProductWithQuantity,
} from "@freedmen-s-trucking/types";
import { useQuery } from "@tanstack/react-query";
import { add, formatDuration, intervalToDuration } from "date-fns";
import { Dropdown, Modal, Tabs } from "flowbite-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import {
  AddressSearchInput,
  OnAddressChangedParams,
  SecondaryButton,
  TextInput,
} from "~/components/atoms";
import { useDbOperations } from "~/hooks/use-firestore";
import { useComputeDeliveryEstimation } from "~/hooks/use-price-calculator";
import { useGetRemoteConfig } from "~/hooks/use-remote-config";
import { RemoteConfigKeys } from "~/utils/constants";
import { formatPrice } from "~/utils/functions";
import { AIAssistedForm } from "./ai-assisted-form";
import { PaymentButton } from "./new-order-payment-button";
import { ManualOrderingForm } from "./manual-ordering-form";
import { DisplayRequiredVehicles } from "./display-vehicles";

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
      <Modal show={showModal} onClose={onCloseModal} size={"lg"} className="">
        <Modal.Header className="p-3 [&>button]:rounded-full [&>button]:bg-accent-400 [&>button]:p-[1px] [&>button]:text-primary-100 [&>button]:transition-all [&>button]:duration-300 hover:[&>button]:scale-110 hover:[&>button]:text-primary-950">
          <motion.span
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  duration: 0.5,
                  ease: "easeIn",
                },
              },
            }}
            className="text-lg font-medium"
          >
            Schedule Delivery
          </motion.span>
        </Modal.Header>
        <Modal.Body className="contents max-h-[80vh] flex-row overflow-hidden p-0">
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
      return result?.data || DEFAULT_PLATFORM_SETTINGS;
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
            } as ProductWithQuantity["estimatedDimensions"],
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
        description: "",
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
                value={packageProps.description}
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
                    value={`${packageProps.estimatedDimensions?.heightInInches}`}
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
                    value={`${packageProps.estimatedDimensions?.widthInInches}`}
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
                    value={`${packageProps.estimatedDimensions?.lengthInInches}`}
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
            {estimations?.vehicle && (
              <div className="flex flex-col  justify-between">
                <h5 className="mb-2 font-medium">Required Vehicle</h5>
                <div className="flex flex-wrap gap-2">
                  <DisplayRequiredVehicles vehicles={[estimations.vehicle]} />
                </div>
              </div>
            )}
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
          packageToDeliver={packages}
          disabled={!!error}
          onOrderCreated={onOrderCreated}
          estimations={estimations || null}
        />
      </form>
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
        <ManualOrderingForm
          brightness={brightness}
          className={className}
          onOrderCreated={onOrderCreated}
        />
      );
  }
};
