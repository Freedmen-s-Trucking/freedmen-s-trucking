import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_CLIENT_SECRET } from "../../utils/envs";
import axios from "axios";
import { useState } from "react";
import { Modal } from "flowbite-react";
import { SERVER_API } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";

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
  orderId: string;
  onComplete: () => void;
}> = ({ showInModal, price, orderId, onComplete }) => {
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
        className=" bg-black bg-opacity-30 [&>div>div]:bg-primary-100 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
      >
        <Modal.Header>
          <span className="text-lg font-medium">Process Payment</span>
        </Modal.Header>
        <Modal.Body>
          <PaymentProvider price={price} orderId={orderId} />
        </Modal.Body>
      </Modal>
    );
  }
  return <PaymentProvider price={price} orderId={orderId} />;
};

const PaymentProvider: React.FC<{ price: number; orderId: string }> = ({
  price,
  orderId,
}) => {
  const {
    data: clientSecret,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["payment-intent", price],
    select: (data) => data?.clientSecret,
    queryFn: async () => {
      const response = await axios.post(
        `${SERVER_API}/v1/stripe/create-payment-intent`,
        {
          amount: price,
          orderId,
        },
      );
      return response.data;
    },
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
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
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
      <button
        disabled={!stripe || isLoading}
        type="submit"
        className="mt-4 rounded-md bg-primary-900 px-5 py-2 text-white"
      >
        {isLoading ? "Loading..." : "Pay"}
      </button>
      {/* Show error message to your customers */}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};

export default StripePayment;
