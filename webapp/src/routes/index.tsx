import { createFileRoute } from "@tanstack/react-router";
import { Button } from "flowbite-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <div className="bg-primary w-100 inset-0 mx-auto h-screen max-w-screen-xl px-4 py-8  md:px-8 md:py-12 lg:px-16">
        <div className="mx-auto w-full pt-56 text-center md:mx-0 md:w-5/6 md:pt-24 md:text-start">
          <h1 className="mb-4 text-5xl font-extrabold leading-none tracking-tight text-white lg:text-6xl">
            FREEDMEN'S <span>LAST MILE</span>
          </h1>
          <p className="mb-8 text-xs font-normal text-gray-300  md:w-3/5 lg:text-lg">
            Powered by AI. Built for Speed.
          </p>

          <div className="flex flex-row gap-x-4">
            <div className="flex flex-col gap-y-4">
              <Button color="primary">Become a Driver</Button>
              <p className="text-xs font-normal text-gray-300">
                Start earning with your own schedule. Simple setup, instant
                payouts, full flexibility.
              </p>
            </div>
            <div className="flex flex-col gap-y-4">
              <Button color="light">Place a Delivery</Button>
              <p className="text-xs font-normal text-gray-300">
                Fast, reliable, professional logistics. Trusted by businessers
                and individuals across the country.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
