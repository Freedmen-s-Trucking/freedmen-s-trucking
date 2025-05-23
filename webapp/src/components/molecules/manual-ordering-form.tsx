import {
  DEFAULT_PLATFORM_SETTINGS,
  DistanceMeasurement,
  LATEST_PLATFORM_SETTINGS_PATH,
  Location,
  OrderPriority,
  ProductWithQuantity,
  RequiredVehicleEntity,
} from "@freedmen-s-trucking/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "flowbite-react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AddressSearchInput, Heading2 } from "~/components/atoms";
import { useDbOperations } from "~/hooks/use-firestore";
import { formatPrice } from "~/utils/functions";
import { PrimaryButton, TextArea, TextInput } from "../atoms/base";
import { PaymentButton } from "./new-order-payment-button";
import { useServerRequest } from "~/hooks/use-server-request";
import {
  getDistanceFromGoogle,
  metersToMiles,
} from "~/hooks/use-price-calculator";
import { isResponseError } from "up-fetch";
import { DisplayRequiredVehicles } from "./display-vehicles";

export const ManualOrderingForm: React.FC<{
  brightness: "dark" | "light";
  className?: string;
  onOrderCreated?: () => void;
}> = ({ brightness, className, onOrderCreated }) => {
  const { fetchPlatformSettings } = useDbOperations();

  const { data: availableCities } = useQuery({
    initialData: null,
    queryKey: [LATEST_PLATFORM_SETTINGS_PATH],
    queryFn: () => {
      return fetchPlatformSettings();
    },
    throwOnError(error, query) {
      console.error(error, query);
      return true;
    },
    select: (result) => {
      return (result?.data || DEFAULT_PLATFORM_SETTINGS).availableCities || [];
    },
  });

  type RequestInfo = {
    product?: ProductWithQuantity;
    pickupLocation?: Location;
    dropoffLocation?: Location;
    clientPhoneNumber?: string;
    urgencyLevel?: OrderPriority;
  };
  const [reqInfo, setReqInfo] = useState<RequestInfo>({});
  const [error, setError] = useState<Error | null>(null);
  const [estimations, setEstimations] = useState<{
    distanceInMiles?: number | undefined;
    durationInSeconds?: number | null | undefined;
    distanceMeasurement?: DistanceMeasurement | undefined;
    vehicle: RequiredVehicleEntity;
    fees: number;
    driverFees: number;
  } | null>(null);

  const serverRequest = useServerRequest();

  const { data: distanceData, error: distanceError } = useQuery({
    queryKey: [
      "distance-data",
      reqInfo.pickupLocation?.latitude,
      reqInfo.pickupLocation?.longitude,
      reqInfo.dropoffLocation?.latitude,
      reqInfo.dropoffLocation?.longitude,
    ],
    queryFn: async () => {
      if (!reqInfo.pickupLocation || !reqInfo.dropoffLocation) {
        return null;
      }
      return getDistanceFromGoogle(
        reqInfo.pickupLocation,
        reqInfo.dropoffLocation,
      );
    },
    enabled: !!reqInfo.pickupLocation && !!reqInfo.dropoffLocation,
    select: (result) => {
      if (!result) {
        return null;
      }
      const route = result[0];
      const durationInSeconds = parseInt(route.duration);
      return {
        distanceMeasurement: DistanceMeasurement.GOOGLE_DISTANCE_MATRIX,
        distanceInMiles: metersToMiles(route.distanceMeters || 0),
        durationInSeconds: isNaN(durationInSeconds) ? null : durationInSeconds,
      };
    },
  });

  const { mutate: autoDetectRequestAndEstimateFees, isPending } = useMutation({
    mutationKey: ["auto-detect-request-and-estimate-fees", availableCities],
    mutationFn: async (ev?: React.FormEvent<HTMLFormElement> | null) => {
      ev?.preventDefault();
      setError(null);
      if (!reqInfo.pickupLocation) {
        setError(new Error("Please provide a pickup location"));
        return null;
      }
      if (!reqInfo.dropoffLocation) {
        setError(new Error("Please provide a dropoff location"));
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!distanceData) {
        if (distanceError) {
          setError(new Error("Failed to get distance data"));
          console.error(distanceError);
        }
        setTimeout(() => {
          autoDetectRequestAndEstimateFees(ev);
        }, 1000);
        return null;
      }

      const pickupLocation = reqInfo.pickupLocation;
      const dropoffLocation = reqInfo.dropoffLocation;

      const pickupCityPrice = availableCities?.find(
        (city) =>
          pickupLocation.latitude >= city.viewPort.low.latitude &&
          pickupLocation.latitude <= city.viewPort.high.latitude &&
          pickupLocation.longitude >= city.viewPort.low.longitude &&
          pickupLocation.longitude <= city.viewPort.high.longitude,
      );
      const dropoffCityPrice = availableCities?.find(
        (city) =>
          dropoffLocation.latitude >= city.viewPort.low.latitude &&
          dropoffLocation.latitude <= city.viewPort.high.latitude &&
          dropoffLocation.longitude >= city.viewPort.low.longitude &&
          dropoffLocation.longitude <= city.viewPort.high.longitude,
      );

      const priceInPickupCity = pickupCityPrice?.priceMap?.find(
        (price) =>
          (price.minMiles || 0) <= distanceData.distanceInMiles &&
          (price.maxMiles || Infinity) >= distanceData.distanceInMiles,
      );
      const priceInDropoffCity = dropoffCityPrice?.priceMap?.find(
        (price) =>
          (price.minMiles || 0) <= distanceData.distanceInMiles &&
          (price.maxMiles || Infinity) >= distanceData.distanceInMiles,
      );

      const feeMap = priceInPickupCity || priceInDropoffCity;
      if (distanceData.distanceInMiles > 12) {
        setError(new Error("Distance is too long"));
        return null;
      }
      if (!feeMap) {
        const error = new Error("Failed to get price");
        setError(error);
        throw {
          ...error,
          priceInPickupCity,
          priceInDropoffCity,
          pickupCityPrice,
          dropoffCityPrice,
          availableCities,
          estimations,
        };
      }

      return {
        distanceInMiles: distanceData.distanceInMiles,
        durationInSeconds: distanceData.durationInSeconds,
        distanceMeasurement: distanceData.distanceMeasurement,
        vehicle: {
          type: "SEDAN",
          quantity: 1,
          fees: feeMap.driverFees,
          weightToBeUsedInLbs: 0,
        } satisfies RequiredVehicleEntity,
        fees: feeMap.customerFees,
        driverFees: feeMap.driverFees,
      };
    },
    onSuccess(data, variables, context) {
      console.log({ data, variables, context });
      if (!data) {
        return;
      }
      setEstimations(data);
    },
    onError(error, variables, context) {
      console.error({ error, variables, context });
      if (isResponseError(error)) {
        setError(new Error("Failed to get distance, please try again"));
        serverRequest("/logs", {
          method: "POST",
          body: {
            error,
            variables,
            context,
          },
        });
      } else {
        setError(new Error("Unknown error occurred, please try again"));
        serverRequest("/logs", {
          method: "POST",
          body: {
            error,
            variables,
            context,
          },
        });
      }
    },
  });

  // Inside your AIAssistedForm component:
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever qas changes
    console.log(formContainerRef.current);
    if (formContainerRef.current) {
      formContainerRef.current.scrollTo({
        top: formContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [estimations]); // Only run when qas.length changes

  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden"
      ref={formContainerRef}
    >
      <div
        className={`flex flex-col items-center gap-4 rounded-3xl border p-4 pb-8 ${brightness === "dark" ? "border-white bg-white/20" : ""} ${className}`}
      >
        <form
          onSubmit={(e) => autoDetectRequestAndEstimateFees(e)}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
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
          >
            <Heading2 className="text-center">
              Schedule a Delivery — Just Tell Us Where & We'll Handle the Rest
            </Heading2>
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  delay: 0.3,
                  ease: "easeOut",
                  delayChildren: 0.5,
                  staggerChildren: 0.2,
                },
              },
            }}
            className="w-full py-1 md:px-12"
          >
            <AddressSearchInput
              onAddressChanged={(params) => {
                setReqInfo({
                  ...reqInfo,
                  dropoffLocation: params.place ?? undefined,
                });
              }}
              required
              restrictedGMARecBounds={availableCities?.map(
                (city) => city.viewPort,
              )}
              id="pickup-location-input"
              maxLength={250}
              placement="bottom"
              className={`block w-full rounded-full border p-3 text-center text-sm text-black placeholder:text-sm focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
              placeholder="Enter pickup location"
              // className={`block w-full border px-[8px] py-1 text-xs text-black placeholder:text-xs focus:border-red-400 focus:outline-none focus:ring-transparent xs:py-2 sm:py-3 md:h-auto ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
              // placeholder={'Enter the description of your order'}
            />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  delay: 0.4,
                  ease: "easeOut",
                  delayChildren: 0.5,
                  staggerChildren: 0.2,
                },
              },
            }}
            className="w-full py-1 md:px-12"
          >
            <AddressSearchInput
              onAddressChanged={(params) => {
                setReqInfo({
                  ...reqInfo,
                  pickupLocation: params.place ?? undefined,
                });
              }}
              placement="bottom"
              required
              restrictedGMARecBounds={availableCities?.map(
                (city) => city.viewPort,
              )}
              id="dropoff-location-input"
              maxLength={250}
              className={`block w-full rounded-full border p-3 text-center text-sm text-black placeholder:text-sm focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
              placeholder="Enter dropoff location"
              // className={`block w-full border px-[8px] py-1 text-xs text-black placeholder:text-xs focus:border-red-400 focus:outline-none focus:ring-transparent xs:py-2 sm:py-3 md:h-auto ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
              // placeholder={'Enter the description of your order'}
            />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  delay: 0.55,
                  ease: "easeOut",
                  delayChildren: 0.5,
                  staggerChildren: 0.2,
                },
              },
            }}
            className="w-full py-1 md:px-12"
          >
            <TextInput
              name="text"
              type="tel"
              required
              minLength={8}
              value={reqInfo?.clientPhoneNumber || ""}
              onEnter={() => autoDetectRequestAndEstimateFees(null)}
              onChange={(e) => {
                const purifiedPhoneNumber = e.target.value.replace(
                  /[^0-9\s-+()]/g,
                  "",
                );
                setReqInfo({
                  ...reqInfo,
                  clientPhoneNumber: purifiedPhoneNumber,
                });
              }}
              className={`block w-full border px-[8px] py-1 text-center text-sm text-black placeholder:text-sm focus:border-red-400 focus:outline-none focus:ring-transparent xs:py-2 sm:py-3 md:h-auto ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
              placeholder={"Enter phone number"}
            />
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  delay: 0.55,
                  ease: "easeOut",
                  delayChildren: 0.5,
                  staggerChildren: 0.2,
                },
              },
            }}
            className="w-full py-1 md:px-12"
          >
            <TextArea
              name="text"
              value={reqInfo?.product?.description || ""}
              minLength={10}
              onEnter={() => autoDetectRequestAndEstimateFees(null)}
              onChange={(e) =>
                setReqInfo({
                  ...reqInfo,
                  product: {
                    ...reqInfo?.product,
                    description: e.target.value,
                    quantity: 1,
                  },
                })
              }
              rows={2}
              className={`block w-full rounded-full border px-[8px] py-1 text-center text-xs text-black placeholder:text-xs focus:border-red-400 focus:outline-none focus:ring-transparent xs:py-2 sm:py-3 md:h-auto ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
              placeholder={
                "Enter order number or additional details (optional)"
              }
            />
          </motion.div>
          {estimations && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`flex w-full flex-col gap-1 text-wrap rounded-xl border p-3 text-sm  shadow-md focus:outline-none  focus:ring-transparent sm:text-[16px] md:w-11/12 ${brightness === "dark" ? "border-gray-300 text-white focus:border-red-400" : " bg-primary-50 text-secondary-900 focus:border-red-900"}`}
            >
              <span className="block text-xs">
                Order:{" "}
                <span className="font-bold">
                  {reqInfo?.product?.description}
                  {(reqInfo?.product?.quantity || 0) > 1
                    ? ` x ${reqInfo?.product?.quantity}`
                    : ""}
                </span>
              </span>
              <div className="flex items-center">
                <span className="inline flex-1 text-start text-sm">
                  {reqInfo.pickupLocation?.address}
                </span>
                <span className="inline">
                  <ArrowRight className="inline" />
                </span>
                <span className="inline flex-1 text-end text-sm">
                  {reqInfo.dropoffLocation?.address}
                </span>
              </div>
              <span className="block text-xs">
                <PriorityBadge priority={OrderPriority.STANDARD} />
              </span>
              <div className="flex items-center">
                <DisplayRequiredVehicles vehicles={[estimations?.vehicle]} />
              </div>
              <span className="block pt-2 text-xl font-bold text-primary-900">
                {estimations?.fees !== undefined
                  ? formatPrice(estimations.fees)
                  : "N/A"}
              </span>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, scaleY: 1, scaleX: 0.8 }}
              animate={{
                opacity: 1,
                scaleY: 1,
                scaleX: 1,
                transition: { duration: 0.1, type: "spring", stiffness: 200 },
              }}
              className={`inline-block w-full rounded-lg p-1 text-center text-red-500 transition-all duration-500 ${error ? "" : "hidden"} ${brightness === "dark" ? "bg-white " : ""}`}
            >
              {error.message}
            </motion.div>
          )}

          {!estimations && !isPending && (
            <PrimaryButton
              type="submit"
              className="py-2"
              // loadingIcon=
            >
              Estimate Delivery
            </PrimaryButton>
          )}
        </form>
        {isPending && !estimations && (
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
            isLoading={isPending}
            estimations={estimations || null}
            clientInfo={{ clientPhone: reqInfo.clientPhoneNumber! }}
            pickupLocation={reqInfo.pickupLocation || null}
            deliveryLocation={reqInfo.dropoffLocation || null}
            deliveryPriority={reqInfo.urgencyLevel || null}
            packageToDeliver={reqInfo.product ? [reqInfo.product] : []}
            onOrderCreated={onOrderCreated}
          />
        )}
      </div>
    </div>
  );
};

const PriorityBadge: React.FC<{ priority: OrderPriority }> = ({ priority }) => {
  switch (priority) {
    case OrderPriority.URGENT:
      return (
        <Badge className="inline" color="red">
          Urgent
        </Badge>
      );
    case OrderPriority.EXPEDITED:
      return (
        <Badge className="inline" color="yellow">
          Expedited
        </Badge>
      );
    case OrderPriority.STANDARD:
      return (
        <Badge className="inline" color="blue">
          Standard
        </Badge>
      );
    default:
      return (
        <Badge className="inline" color="gray">
          Unknown
        </Badge>
      );
  }
};
