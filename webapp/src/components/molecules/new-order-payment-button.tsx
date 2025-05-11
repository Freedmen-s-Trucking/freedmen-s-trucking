import {
  ApiReqScheduleDeliveryIntent,
  DistanceMeasurement,
  Location,
  OrderPriority,
  ProductWithQuantity,
  RequiredVehicleEntity,
} from "@freedmen-s-trucking/types";
import React, { useCallback, useState } from "react";
import { PrimaryButton } from "~/components/atoms";
import StripePayment from "~/components/molecules/stripe-payment";
import { useAuth } from "~/hooks/use-auth";
import { setRequestedAuthAction } from "~/stores/controllers/app-ctrl";
import { useAppDispatch } from "~/stores/hooks";

export const PaymentButton: React.FC<{
  isLoading: boolean;
  onOrderCreated?: () => void;
  pickupLocation: Location | null;
  deliveryLocation: Location | null;
  deliveryPriority: OrderPriority | null;
  packages: ProductWithQuantity[];
  disabled: boolean;
  estimations: {
    distanceInMiles?: number | undefined;
    durationInSeconds?: number | null;
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
        className="py-2"
        type={validEstimations ? "button" : "submit"}
        onClick={validEstimations ? handleScheduleDelivery : undefined}
        isLoading={isLoading || isScheduling}
      >
        {isScheduling || isLoading
          ? "Scheduling..."
          : estimations?.fees
            ? `✓ Confirm + Pay`
            : "Estimate Delivery"}
      </PrimaryButton>
    </>
  );
};
