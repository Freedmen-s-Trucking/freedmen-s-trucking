import { createFileRoute } from "@tanstack/react-router";
import home2LogoBlured from "../assets/images/home-2-blur.webp";
import home2Logo from "../assets/images/home-2.webp";
import Hero from "../components/molecules/hero";
import FAQ from "../components/molecules/faq";
import AppFooter from "../components/organisms/footer";
import scheduleDeliveryHeroImg from "../assets/images/schedule-delivery-hero.webp";
import scheduleDeliveryHeroImgBlured from "../assets/images/schedule-delivery-hero-blur.webp";
import { AppImageBackground } from "../components/atoms/image-background";
import { useAuth } from "../hooks/use-auth";
import {
  AddressSearchInput,
  AddressSearchInputProps,
} from "../components/atoms/address-search-input";
import { UserEntity } from "@freedman-trucking/entities";
import { Dropdown } from "flowbite-react";
import { useState } from "react";

export const Route = createFileRoute("/schedule-delivery")({
  component: RouteComponent,
});

const DeliveryPriorities = [
  {
    label: "Standart",
    value: 0,
  },
  {
    label: "Expedited",
    value: 1,
  },
  {
    label: "Urgent",
    value: 1.5,
  },
] as const;
const contacts = [
  {
    label: "Phone",
    Value: ({
      user,
      ...other
    }: { user: UserEntity } & Record<string, unknown>) => (
      <>
        <input {...other} readOnly type="text" value={user.phoneNumber || ""} />
      </>
    ),
  },
  {
    label: "Email",
    Value: ({
      user,
      ...other
    }: { user: UserEntity } & Record<string, unknown>) => (
      <>
        <input {...other} readOnly type="email" value={user.email || ""} />
      </>
    ),
  },
  {
    label: "Adress",
    Value: ({
      user,
      ...other
    }: { user: UserEntity } & Record<string, unknown>) => (
      <>
        <input {...other} readOnly type="text" value={user && "???"} />
      </>
    ),
  },
];

function RouteComponent() {
  const { user, signInWithGoogle } = useAuth();
  const [deliveryPriority, setDeliveryPriorityInput] =
    useState<(typeof DeliveryPriorities)[number]>();
  const estimatedCostInUSD = 0;
  const formatedEstimation = () =>
    new Intl.NumberFormat("en-US", {
      currency: "USD",
      style: "currency",
    }).format(estimatedCostInUSD);

  const onPickupLocationChanged: AddressSearchInputProps["onAddressChanged"] = (
    data,
  ) => {
    console.log("onPickupLocationChanged", data);
  };

  return (
    <>
      <Hero
        image={scheduleDeliveryHeroImg}
        bluredImage={scheduleDeliveryHeroImgBlured}
        className="min-h-screen"
      >
        <div className="flex flex-col items-center justify-center px-4 pt-16 sm:px-12 md:flex-row">
          <div className="mx-auto mb-8 w-[min(100%,350px)]  max-w-md bg-black/80 px-8 py-8 md:mx-0 md:mb-0 md:w-full">
            <h2 className="text-center text-4xl font-bold text-white md:text-start">
              Schedule Your Delivery
            </h2>
            <p className="py-4 text-center text-sm text-white md:text-start">
              Enter your details to get started.
            </p>
            {user.isAnonymous && (
              <div className="flex flex-col items-center justify-center gap-4">
                <button
                  onClick={signInWithGoogle}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-black"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-5 w-5"
                  />
                  Sign in with Google
                </button>
              </div>
            )}
            {!user.isAnonymous &&
              contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex w-full flex-row items-center justify-between text-white"
                >
                  <span>{contact.label}:</span>
                  <contact.Value
                    user={user.info}
                    className="inline rounded-sm border-none bg-transparent p-0 text-end text-white focus:border-none focus:outline-none focus:ring-0"
                  />
                </div>
              ))}
          </div>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-r from-[rgba(102,102,102,0.6)] to-[rgba(0,0,0,0.6)]">
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-white bg-white/20 p-8">
              <AddressSearchInput
                onAddressChanged={onPickupLocationChanged}
                required
                id="pickup-location-input"
                maxLength={250}
                className="block w-full rounded-xl border border-gray-300 bg-gray-200 p-3 text-center text-sm text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent"
                placeholder="Enter pickup location"
              />
              <AddressSearchInput
                onAddressChanged={onPickupLocationChanged}
                required
                id="enter-delivery-input"
                maxLength={250}
                className="block w-full rounded-xl border border-gray-300 bg-gray-200 p-3 text-center text-sm text-black placeholder:text-lg focus:border-red-400 focus:outline-none focus:ring-transparent"
                placeholder="Enter delivery location"
              />
              <input
                required
                type="number"
                id="package-wheight-input"
                maxLength={30}
                className="block w-full rounded-xl border border-gray-300 bg-gray-200 p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent"
                placeholder="Enter package weight (lbs)"
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
                    className="block w-full cursor-pointer rounded-xl border border-gray-300 bg-gray-200 p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent"
                    placeholder="Delivery Type >"
                  />
                )}
              >
                {DeliveryPriorities.map((props) => (
                  <Dropdown.Item
                    key={props.label}
                    onClick={() => setDeliveryPriorityInput(props)}
                  >
                    {props.label}
                  </Dropdown.Item>
                ))}
              </Dropdown>
              <input
                spellCheck
                readOnly
                disabled
                id="contact-message-input"
                className="block w-full text-wrap rounded-xl border border-gray-300 bg-amber-400/30 p-3 text-center text-sm text-white focus:border-red-400 focus:outline-none focus:ring-transparent sm:text-[16px]"
                value={`Estimated Delivery Cost: ${formatedEstimation()}`}
              />
              <button className="rounded-xl bg-black/90 px-5 py-3 text-white">
                Calculate & Schedule Now
              </button>
            </div>
          </div>
        </div>
      </Hero>
      <AppImageBackground
        className="bg-scroll"
        src={home2Logo}
        placeholder={home2LogoBlured}
        customGradient="linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8))"
      >
        <FAQ />
      </AppImageBackground>
      <AppFooter />
    </>
  );
}
