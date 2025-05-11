import {
  ApiReqExtractOrderRequestFromText,
  ApiResExtractOrderRequestFromText,
  apiResExtractOrderRequestFromText,
  LATEST_PLATFORM_SETTINGS_PATH,
  Location,
  OrderPriority,
  PlatformSettingsEntity,
  RequiredVehicleEntity,
  type,
} from "@freedmen-s-trucking/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge, Dropdown } from "flowbite-react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BsTrainFreightFront } from "react-icons/bs";
import { GiTruck } from "react-icons/gi";
import { IoCarOutline } from "react-icons/io5";
import { PiVanBold } from "react-icons/pi";
import { TbCarSuv } from "react-icons/tb";
import { Heading2 } from "~/components/atoms";
import { useDbOperations } from "~/hooks/use-firestore";
import { fetchPlaceDetails } from "~/hooks/use-geocoding";
import { useComputeDeliveryEstimation } from "~/hooks/use-price-calculator";
import { useServerRequest } from "~/hooks/use-server-request";
import { formatPrice } from "~/utils/functions";
import { TextArea, TextInput } from "../atoms/base";
import { PaymentButton } from "./new-order-payment-button";

export const AIAssistedForm: React.FC<{
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
      Exclude<ApiResExtractOrderRequestFromText["data"]["order"], null>,
      "pickupLocation" | "dropoffLocation"
    >
  > & {
    pickupLocation?: Location;
    dropoffLocation?: Location;
  };
  const [reqInfo, setReqInfo] = useState<RequestInfo>({});
  const [threadId, setThreadId] = useState<string | null>(null);
  const [qas, setQAs] = useState<
    {
      chatId: string | null;
      question: Exclude<
        Required<
          ApiResExtractOrderRequestFromText["data"]["onboarding"]
        >["pendingQuestion"],
        null
      >;
      answer: string | number | undefined;
    }[]
  >([
    {
      chatId: null,
      question: {
        type: "open_text",
        field: "",
        question: "",
        exampleAnswer: "e.g. 4 tires from Waldorf to Baltimore - need by 3PM",
      },
      answer: undefined,
    },
  ]);

  const errorState = useState<Error | null>(null);
  const setError = errorState[1];
  let error = errorState[0];

  const serverRequest = useServerRequest();
  const { mutate: autoDetectRequestAndEstimateFees, isPending } = useMutation({
    mutationKey: ["auto-detect-request-and-estimate-fees", availableCities],
    mutationFn: async ({
      ev,
      id,
    }: {
      ev?: React.FormEvent<HTMLFormElement> | null;
      id?: number;
    }) => {
      ev?.preventDefault();
      setError(null);
      setReqInfo({});

      const pos = typeof id === "number" ? id : qas.length - 1;
      setQAs([...qas.slice(0, pos + 1)]);
      const lastQa = qas[pos];
      let reqText: string;
      if (lastQa.answer === undefined) {
        throw new Error("Please provide an answer");
      } else {
        switch (lastQa.question.type) {
          case "open_text":
            reqText = `${lastQa.answer}`;
            break;
          case "boolean":
            reqText =
              lastQa.question.boolean_options?.[lastQa.answer as number] || "";
            break;
          case "select":
            reqText = JSON.stringify(
              lastQa.question.options?.[lastQa.answer as number] || "",
            );
            break;
        }
      }

      const res = await serverRequest("/ai-agent/extract-order-request", {
        method: "POST",
        body: {
          text: reqText,
          chatId: lastQa.chatId,
          threadId: threadId || undefined,
        } satisfies ApiReqExtractOrderRequestFromText,
        schema: apiResExtractOrderRequestFromText,
      });
      setThreadId(res.threadId);

      const orderType = apiResExtractOrderRequestFromText
        .get("data")
        .get("order")
        .exclude("null")
        .required();

      const order = orderType(res.data.order);
      if (order instanceof type.errors) {
        if (res.data?.onboarding?.pendingQuestion) {
          setQAs([
            ...qas.slice(0, pos + 1),
            {
              chatId: res.chatId,
              question: res.data.onboarding.pendingQuestion,
              answer: undefined,
            },
          ]);
          throw null;
        } else {
          throw new Error("Something went wrong");
        }
      }

      const pickupLocation = await fetchPlaceDetails({
        placeId: order.pickupLocation.placeId,
        address: order.pickupLocation.address,
      });

      const dropoffLocation = await fetchPlaceDetails({
        placeId: order.dropoffLocation.placeId,
        address: order.dropoffLocation.address,
      });

      return {
        ...order,
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
      if (error instanceof Error) {
        setError(error);
        serverRequest("/logs", {
          method: "POST",
          body: {
            error,
            variables,
            context,
          },
        });
        setError(new Error("Something went wrong Please try again"));
      }
    },
  });

  const estimation = useComputeDeliveryEstimation({
    products: reqInfo.items,
    deliveryLocation: reqInfo.dropoffLocation,
    pickupLocation: reqInfo.pickupLocation,
    priority: reqInfo.urgencyLevel || OrderPriority.STANDARD,
  });
  const { isFetching, result: estimations } = estimation;
  error ??= estimation.error;

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
  }, [qas.length, estimations]); // Only run when qas.length changes

  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden"
      ref={formContainerRef}
    >
      <div
        className={`flex flex-col items-center gap-4 rounded-3xl border p-4 pb-8 ${brightness === "dark" ? "border-white bg-white/20" : ""} ${className}`}
      >
        <form
          onSubmit={(e) =>
            autoDetectRequestAndEstimateFees({ ev: e, id: undefined })
          }
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
            <Heading2 className="text-center font-serif">
              Describe What You Need Delivered - We'll Handle The Rest
            </Heading2>
          </motion.div>
          {qas.map((qa, i) => (
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
              key={i}
              className="w-full py-1"
            >
              {qa.question.question && (
                <motion.p
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.3,
                        delay: 0.1,
                        ease: "easeOut",
                      },
                    },
                  }}
                  className="text-xs text-black"
                >
                  {qa.question.question}
                </motion.p>
              )}

              {qa.question.type === "open_text" && (
                <TextArea
                  name="text"
                  required
                  value={qa.answer}
                  minLength={10}
                  onEnter={() =>
                    autoDetectRequestAndEstimateFees({ ev: undefined, id: i })
                  }
                  onChange={(e) =>
                    setQAs((prev) => {
                      const newQa = [...prev];
                      newQa[i] = {
                        ...prev[i],
                        answer: e.target.value,
                      };
                      return newQa;
                    })
                  }
                  // readOnly={i + 1 !== qas.length}
                  rows={i < 1 ? 3 : 2}
                  className={`word-spacing-tight block ${i < 1 ? "h-11" : "h-7"} w-full rounded-lg border px-[8px] py-1 text-xs tracking-tight text-black placeholder:text-xs focus:border-red-400 focus:outline-none focus:ring-transparent xs:py-2 sm:py-3 md:h-auto md:w-11/12 ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                  placeholder={qa.question.exampleAnswer}
                />
              )}
              {!!qa.question.options?.length && (
                <>
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
                          qa.answer === undefined
                            ? ""
                            : qa.question.options?.[(qa.answer as number) || 0]
                                .displayValue
                        }
                        id="delivery-type-input"
                        className={`block w-full cursor-pointer rounded-xl border p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                        placeholder="Select >"
                      />
                    )}
                  >
                    {qa.question.options.map((props, idx) => (
                      <Dropdown.Item
                        key={props.id}
                        onClick={() => {
                          setQAs((prev) => {
                            const newQa = [...prev];
                            newQa[i] = {
                              ...prev[i],
                              answer: idx,
                            };
                            return newQa;
                          });
                          autoDetectRequestAndEstimateFees({
                            ev: undefined,
                            id: i,
                          });
                        }}
                        className="hover:bg-primary-100"
                      >
                        {props.displayValue}
                      </Dropdown.Item>
                    ))}
                  </Dropdown>
                </>
              )}
              {!!qa.question.boolean_options?.length && (
                <>
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
                          qa.answer === undefined
                            ? ""
                            : qa.question.boolean_options?.[
                                (qa.answer as number) || 0
                              ]
                        }
                        id="delivery-type-input"
                        className={`block w-full cursor-pointer rounded-xl border p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent ${brightness === "dark" ? "border-gray-300 bg-gray-200" : ""}`}
                        placeholder="Priority >"
                      />
                    )}
                  >
                    {qa.question.boolean_options.map((props, idx) => (
                      <Dropdown.Item
                        key={props}
                        onClick={() => {
                          setQAs((prev) => {
                            const newQa = [...prev];
                            newQa[i] = {
                              ...prev[i],
                              answer: idx,
                            };
                            return newQa;
                          });
                          autoDetectRequestAndEstimateFees({
                            ev: undefined,
                            id: i,
                          });
                        }}
                        className="hover:bg-primary-100"
                      >
                        {props}
                      </Dropdown.Item>
                    ))}
                  </Dropdown>
                </>
              )}
            </motion.div>
          ))}
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
              className={`flex w-full flex-col gap-1 text-wrap rounded-xl border p-3 text-sm  shadow-md focus:outline-none  focus:ring-transparent sm:text-[16px] md:w-11/12 ${brightness === "dark" ? "border-gray-300 text-white focus:border-red-400" : " bg-primary-50 text-secondary-900 focus:border-red-900"}`}
            >
              <span className="block text-xs">
                Order:{" "}
                <span className="font-bold">
                  {reqInfo?.items?.[0]?.name}
                  {(reqInfo?.items?.[0]?.quantity || 0) > 1
                    ? ` x ${reqInfo?.items?.[0]?.quantity}`
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
                <PriorityBadge
                  priority={reqInfo.urgencyLevel || OrderPriority.STANDARD}
                />
              </span>
              <div className="flex items-center">
                <DisplayRequiredVehicles vehicles={estimations?.vehicles} />
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
    </div>
  );
};

const DisplayRequiredVehicles: React.FC<{
  vehicles: RequiredVehicleEntity[] | undefined;
}> = ({ vehicles }) => {
  const vehicleIcons: Record<RequiredVehicleEntity["type"], React.ReactNode> = {
    SEDAN: <IoCarOutline size={24} className="inline" />,
    SUV: <TbCarSuv size={24} className="inline" />,
    VAN: <PiVanBold size={24} className="inline" />,
    TRUCK: <GiTruck size={24} className="inline" />,
    FREIGHT: <BsTrainFreightFront size={24} className="inline" />,
  };
  return (
    <div className="flex items-center gap-2">
      {(vehicles || []).map((vehicle) => (
        <span key={vehicle.type} className="flex items-center">
          {vehicle.quantity > 1 && (
            <span className="text-sm">{vehicle.quantity}&nbsp;*&nbsp;</span>
          )}
          {vehicleIcons[vehicle.type]}-
          {vehicle.quantity <= 1 && (
            <span className="text-sm">{vehicle.type}</span>
          )}
        </span>
      ))}
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
