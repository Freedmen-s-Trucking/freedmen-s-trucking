import { Modal } from "flowbite-react";
import {
  ApiComputeDeliveryEstimation,
  DriverOrderStatus,
  OrderEntityFields,
  OrderPriority,
  OrderStatus,
  ProductEntity,
  VehicleType,
} from "@freedman-trucking/types";
import { useState } from "react";
import { OSMSearchResult } from "@/hooks/use-geocoding";
import { useDbOperations } from "@/hooks/use-firestore";
import { setRequestedAuthAction } from "@/stores/controllers/app-ctrl";
import { useAppDispatch } from "@/stores/hooks";
import { SERVER_API } from "@/utils/constants";
import { FaTrash } from "react-icons/fa6";
import { Dropdown } from "flowbite-react";
import StripePayment from "@/components/molecules/stripe-payment";
import {
  AddressSearchInput,
  OnAddressChangedParams,
} from "@/components/atoms/address-search-input";
import { useAuth } from "@/hooks/use-auth";

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
  showInModal: boolean;
  brightness: "dark" | "light";
  onComplete: () => void;
}> = ({ showInModal, brightness, onComplete }) => {
  const [showModal, setShowModal] = useState(showInModal);
  const onCloseModal = () => {
    onComplete();
    setShowModal(false);
  };
  if (showInModal) {
    return (
      <Modal show={showModal} onClose={onCloseModal} size={"lg"}>
        <Modal.Header>
          <h1 className="text-lg font-medium">Schedule Delivery</h1>
        </Modal.Header>
        <Modal.Body className="p-0">
          <CreateOrderForm brightness={brightness} />
        </Modal.Body>
      </Modal>
    );
  }
  return <CreateOrderForm brightness={brightness} />;
};

export const CreateOrderForm: React.FC<{ brightness: "dark" | "light" }> = ({
  brightness,
}) => {
  const { user } = useAuth();
  const [deliveryPriority, setDeliveryPriorityInput] =
    useState<(typeof OrderPriorities)[number]>();
  const { createOrder } = useDbOperations();
  const [estimations, setEstimations] = useState<{
    vehicles: Array<{ type: VehicleType; count: number }>;
    cost: number;
    distanceInMiles: number;
    durationInSeconds?: number | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formattedEstimation = () =>
    new Intl.NumberFormat("en-US", {
      currency: "USD",
      style: "currency",
    }).format(estimations?.cost ?? 0);

  const [packages, setPackages] = useState<ProductEntity[]>([]);

  const [pickupLocation, setPickupLocation] = useState<OSMSearchResult | null>(
    null,
  );

  const [deliveryLocation, setDeliveryLocation] =
    useState<OSMSearchResult | null>(null);

  const onPickupLocationChanged = (params: OnAddressChangedParams) => {
    console.log({ onPickupLocationChanged: params });
    setEstimations(null);
    setPickupLocation(params.address);
  };

  const onDeliveryPriorityChanged = (
    params: (typeof OrderPriorities)[number],
  ) => {
    console.log({ onDeliveryPriorityChanged: params });
    setEstimations(null);
    setDeliveryPriorityInput(params);
  };

  const onDeliveryLocationChanged = (params: OnAddressChangedParams) => {
    console.log({ onDeliveryLocationChanged: params });
    setEstimations(null);
    setDeliveryLocation(params.address);
  };

  const dispatch = useAppDispatch();
  const requestSignIn = () => dispatch(setRequestedAuthAction("login"));
  const handlePackageChange =
    (index: number) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = event.target;
      // if (type === "number") {
      //   const int = parseInt(value);
      //   if (isNaN(int) || int < 0) {
      //     return;
      //   }
      // }
      setPackages((previousPackages) => {
        const newPackages = [...previousPackages];
        if (
          name === "dimensions.heightInInches" ||
          name === "dimensions.widthInInches" ||
          name === "dimensions.lengthInInches"
        ) {
          const dimensionName = name.split(".")[1];
          newPackages[index] = {
            ...newPackages[index],
            dimensions: {
              ...newPackages[index].dimensions,
              [dimensionName]: value,
            },
          };
        } else {
          newPackages[index] = {
            ...newPackages[index],
            [name]: value,
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
        weightInLbs: 0,
        dimensions: {
          heightInInches: 0,
          widthInInches: 0,
          lengthInInches: 0,
        },
        quantity: 1,
      },
    ]);
  };

  const [isComputingEstimation, setIsComputingEstimation] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [processPayment, setProcessPayment] = useState<{
    orderId: string;
  } | null>(null);

  const handleScheduleDelivery = async () => {
    if (
      !pickupLocation ||
      !deliveryLocation ||
      user.isAnonymous ||
      !deliveryPriority ||
      !packages?.length ||
      !estimations
    ) {
      return;
    }
    setIsScheduling(true);
    try {
      const orderId = await createOrder({
        [OrderEntityFields.clientName]:
          user.info.displayName || user.info.email || "",
        [OrderEntityFields.clientId]: user.info.uid,
        [OrderEntityFields.pickupLocation]: {
          address: pickupLocation?.display_name || "",
          latitude: +pickupLocation.lat || 0,
          longitude: +pickupLocation.lon || 0,
        },
        [OrderEntityFields.deliveryLocation]: {
          address: deliveryLocation?.display_name || "",
          latitude: +deliveryLocation.lat || 0,
          longitude: +deliveryLocation.lon || 0,
        },
        [OrderEntityFields.products]: packages,
        [OrderEntityFields.priority]: deliveryPriority?.value || "standard",
        [OrderEntityFields.status]: OrderStatus.PENDING_PAYMENT,
        [OrderEntityFields.driverStatus]: DriverOrderStatus.WAITING,
        [OrderEntityFields.price]: +estimations.cost,
        [OrderEntityFields.requiredVehicles]: [],
        [OrderEntityFields.createdAt]: new Date().toISOString(),
      });
      setProcessPayment({ orderId });
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsScheduling(false);
    }
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
    setEstimations(null);
    const errorMessage = getValidationErrorMessage();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    setError(null);
  };
  const handleComputeEstimation = async (e: React.FormEvent) => {
    e.preventDefault();
    validateForm();
    setProcessPayment(null);
    if (
      !pickupLocation ||
      !deliveryLocation ||
      !deliveryPriority ||
      !packages?.length
    ) {
      return;
    }
    setIsComputingEstimation(true);
    const res = await fetch(`${SERVER_API}/v1/compute-delivery-estimation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        [OrderEntityFields.pickupLocation]: {
          latitude: +pickupLocation.lat,
          longitude: +pickupLocation.lon,
        },
        [OrderEntityFields.deliveryLocation]: {
          latitude: +deliveryLocation.lat,
          longitude: +deliveryLocation.lon,
        },
        [OrderEntityFields.products]: packages,
        [OrderEntityFields.priority]:
          deliveryPriority.value || OrderPriority.STANDARD,
      } as ApiComputeDeliveryEstimation),
    });
    setIsComputingEstimation(false);
    if (!res.ok) {
      console.error("Failed to compute delivery estimation", await res.text());
      return;
    }
    const data: {
      vehicles: {
        type: VehicleType;
        count: number;
      }[];
      cost: number;
      distanceInMiles: number;
      durationInSeconds?: number | null;
    } = await res.json();
    setEstimations(data);
  };

  const handleRemovePackage = (index: number) => () => {
    setPackages((previousPackages) =>
      previousPackages.filter((_, i) => i !== index),
    );
  };

  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-3xl border p-8 ${brightness === "dark" ? "border-white bg-white/20" : ""}`}
    >
      <form
        className="flex flex-col items-center gap-4"
        onSubmit={handleComputeEstimation}
        onChange={validateForm}
      >
        <AddressSearchInput
          onAddressChanged={onPickupLocationChanged}
          required
          id="pickup-location-input"
          maxLength={250}
          className={`block w-full rounded-xl border p-3 text-center text-sm text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
          placeholder="Enter pickup location"
        />
        <AddressSearchInput
          onAddressChanged={onDeliveryLocationChanged}
          required
          id="enter-delivery-input"
          maxLength={250}
          className={`block w-full rounded-xl border p-3 text-center text-sm text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
          placeholder="Enter delivery location"
        />
        <Dropdown
          label=""
          trigger="click"
          renderTrigger={() => (
            <input
              spellCheck
              minLength={10}
              readOnly
              value={deliveryPriority?.label}
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
            >
              {props.label}
            </Dropdown.Item>
          ))}
        </Dropdown>
        <div className="flex max-h-[400px] flex-col gap-4 overflow-y-auto py-2">
          {packages.map((packageProps, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-between gap-4 rounded-xl border p-2 ${brightness === "dark" ? "border-gray-300" : ""}`}
            >
              <input
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
                  <input
                    required
                    type="number"
                    min={1}
                    step={1}
                    name="quantity"
                    id={`package-quantity-input-${index}`}
                    value={packageProps.quantity}
                    onChange={handlePackageChange(index)}
                    className={`block w-full rounded-xl border p-3 text-center text-lg text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                    placeholder="Quantity"
                  />
                </label>
                <label className="flex flex-col items-center gap-1">
                  <span>Weight (lbs)</span>
                  <input
                    required
                    type="number"
                    min={1}
                    step={0.01}
                    name="weightInLbs"
                    id={`package-weight-input-${index}`}
                    value={packageProps.weightInLbs}
                    onChange={handlePackageChange(index)}
                    className={`block w-full rounded-xl border p-3 text-center text-lg text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                    placeholder="Weight (lbs)"
                  />
                </label>
              </div>
              <div className="flex flex-row items-center justify-between gap-2">
                <label className="flex flex-col items-center gap-1">
                  <span>Height (in)</span>
                  <input
                    required
                    type="number"
                    min={1}
                    step={0.01}
                    name="dimensions.heightInInches"
                    id={`package-height-input-${index}`}
                    value={packageProps.dimensions.heightInInches}
                    onChange={handlePackageChange(index)}
                    className={`block w-full rounded-xl border p-3 text-center text-lg text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                    placeholder="Height (in)"
                  />
                </label>
                <label className="flex flex-col items-center gap-1">
                  <span>Width (in)</span>
                  <input
                    required
                    type="number"
                    min={1}
                    step={0.01}
                    name="dimensions.widthInInches"
                    id={`package-width-input-${index}`}
                    value={packageProps.dimensions.widthInInches}
                    onChange={handlePackageChange(index)}
                    className={`block w-full rounded-xl border p-3 text-center text-lg text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                    placeholder="Width (in)"
                  />
                </label>
                <label className="flex flex-col items-center gap-1">
                  <span>Length (in)</span>
                  <input
                    required
                    type="number"
                    min={1}
                    step={0.01}
                    name="dimensions.lengthInInches"
                    id={`package-length-input-${index}`}
                    value={packageProps.dimensions.lengthInInches}
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
          <button
            className={`rounded-xl border border-gray-300 bg-transparent px-4 py-2 transition-all duration-100 hover:bg-gray-200 hover:text-gray-800 ${brightness === "dark" ? "text-white shadow-sm shadow-gray-300/70" : "text-gray-800 shadow-sm shadow-gray-800/70"}`}
            onClick={handleAddPackage}
          >
            Add Package
          </button>
        </div>
        {!getValidationErrorMessage() && estimations && (
          <div
            className={`block w-full text-wrap rounded-xl border  p-3 text-sm  focus:outline-none focus:ring-transparent sm:text-[16px] ${brightness === "dark" ? "border-gray-300 bg-amber-400/30 text-white focus:border-red-400" : "border-gray-300 bg-amber-200/30 text-gray-800 focus:border-red-900"}`}
          >
            {(estimations.vehicles.length && (
              <span className="block">
                Required Vehicle Type:{" "}
                {estimations.vehicles
                  .map((v) => `${v.count}*${v.type}`)
                  .join(", ")}
              </span>
            )) ||
              null}
            {(estimations.cost && (
              <span className="block">
                Estimated Delivery Cost: {formattedEstimation()}
              </span>
            )) ||
              null}
            {estimations.durationInSeconds && (
              <span className="block">
                Estimated Delivery Time: {estimations.durationInSeconds}
              </span>
            )}
            {estimations.distanceInMiles && (
              <span className="block">
                Estimated Distance: {estimations?.distanceInMiles.toFixed(3)}{" "}
                miles
              </span>
            )}
          </div>
        )}
        <div
          className={`inline-block w-full rounded-lg p-1 text-center text-red-500 transition-all duration-500 ${error ? "" : "hidden"} ${brightness === "dark" ? "bg-white " : "bg-gray-950"}`}
        >
          {error}
        </div>
        <button
          type="submit"
          className={`rounded-xl  border bg-transparent px-5 py-3 text-sm shadow-md transition-all duration-100  ${brightness === "dark" ? "text-white shadow-gray-300/70  hover:bg-gray-200 hover:text-gray-800" : "text-gray-900 shadow-gray-800/70 hover:bg-gray-800 hover:text-white  "}`}
          disabled={isComputingEstimation}
        >
          {isComputingEstimation ? "Estimating..." : "Estimate delivery cost"}
        </button>
      </form>
      {(pickupLocation &&
        deliveryLocation &&
        user.isAnonymous &&
        deliveryPriority &&
        packages?.length &&
        estimations && (
          <button
            onClick={requestSignIn}
            className="rounded-full bg-white px-5 py-3 text-gray-800"
            disabled={!estimations}
          >
            Sign In To Continue
          </button>
        )) ||
        null}
      {(pickupLocation &&
        deliveryLocation &&
        !user.isAnonymous &&
        deliveryPriority &&
        packages?.length &&
        estimations && (
          <>
            {processPayment && (
              <StripePayment
                showInModal
                price={estimations.cost}
                orderId={processPayment.orderId}
                onComplete={() => setProcessPayment(null)}
              />
            )}
            <button
              onClick={handleScheduleDelivery}
              className="rounded-xl bg-green-900/90 px-5 py-3 text-white"
              disabled={!estimations || isScheduling}
            >
              {isScheduling
                ? "Scheduling..."
                : `Schedule Now For ${formattedEstimation()}`}
            </button>
          </>
        )) ||
        null}
    </div>
  );
};
