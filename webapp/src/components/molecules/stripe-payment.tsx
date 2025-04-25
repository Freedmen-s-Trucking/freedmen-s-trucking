import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_CLIENT_SECRET, SERVER_API_ENDPOINT } from "~/utils/envs";
import { useState } from "react";
import { Modal } from "flowbite-react";
import { useQuery } from "@tanstack/react-query";
import { PrimaryButton } from "~/components/atoms";
import {
  apiResScheduleDeliveryIntent,
  NewOrder,
} from "@freedmen-s-trucking/types";
import { up } from "up-fetch";

const stripePromise = loadStripe(STRIPE_CLIENT_SECRET!);

const appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#331D10",
    colorBackground: "#FFFCFA",
    colorText: "#001829",
    colorDanger: "#df1b41",
    fontFamily: "Ideal Sans, system-ui, sans-serif",
    spacingUnit: "2px",
    borderRadius: "4px",
  },
} as const;

const StripePayment: React.FC<{
  showInModal: boolean;
  price: number;
  order: NewOrder;
  onComplete: () => void;
}> = ({ showInModal, price, order, onComplete }) => {
  const [showModal, setShowModal] = useState(showInModal);
  const onCloseModal = () => {
    onComplete();
    setShowModal(false);
  };
  if (showInModal) {
    return (
      <Modal
        show={showModal}
        onClose={onCloseModal}
        size={"md"}
        // className=" bg-black bg-opacity-30 [&>div>div]:bg-primary-100 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-center md:[&>div]:h-auto"
      >
        <Modal.Header>
          <span className="text-lg font-medium">Process Payment</span>
        </Modal.Header>
        <Modal.Body>
          <PaymentProvider price={price} order={order} />
        </Modal.Body>
      </Modal>
    );
  }
  return <PaymentProvider price={price} order={order} />;
};

const scheduleDeliveryRequest = async (order: NewOrder) => {
  const request = up(fetch, () => ({
    baseUrl: SERVER_API_ENDPOINT,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRIPE_CLIENT_SECRET}`,
    },
  }));

  const response = await request("/v1/stripe/create-payment-intent", {
    method: "POST",
    schema: apiResScheduleDeliveryIntent,
    body: { metadata: order },
  });
  return response;
};

const PaymentProvider: React.FC<{ price: number; order: NewOrder }> = ({
  price,
  order,
}) => {
  const {
    data: clientSecret,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["payment-intent", price],
    select: (data) => data?.clientSecret,
    queryFn: () => scheduleDeliveryRequest(order),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: clientSecret, appearance }}
    >
      <Payment />
    </Elements>
  );
};

// const StripePayment: React.FC = () => {
//     const stripe = useStripe();
//     const elements = useElements();

//     const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();

//         if (!stripe || !elements) {
//             // Stripe.js has not yet loaded.
//             // Make sure to disable form submission until Stripe.js has loaded.
//             return;
//         }

//         const { error, paymentMethod } = await stripe.createPaymentMethod({
//             type: "card",
//             card: elements.getElement(CardElement) as HTMLInputElement,
//         });

//         if (error) {
//             console.log("[paymentMethod] error", error);
//         } else {
//             console.log("[paymentMethod] success", paymentMethod);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <CardElement />
//             <button type="submit" disabled={!stripe}>
//                 Pay
//             </button>
//         </form>
//     );
// };

const Payment: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      console.log(`
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
`);
      return;
    }

    setIsLoading(true);
    const { error } = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url:
          new URL(window.location.href).origin + "/app/customer/dashboard",
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message || `${error}`);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="m-0 flex flex-col items-stretch p-0"
    >
      <PaymentElement />
      <PrimaryButton
        isLoading={!stripe || isLoading}
        type="submit"
        className="mt-4 rounded-md px-5 py-2 text-white"
      >
        {isLoading ? "Loading..." : "Pay"}
      </PrimaryButton>
      {/* Show error message to your customers */}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};

export default StripePayment;
