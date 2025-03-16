import { createFileRoute } from "@tanstack/react-router";
import home2Logo from "../assets/home-2.webp";
import Hero from "../components/molecules/hero";
import FAQ from "../components/molecules/faq";
import AppFooter from "../components/organisms/footer";
import deliveryTrackingImg from "../assets/track-delivery-hero.webp";

export const Route = createFileRoute("/tracking")({
  component: RouteComponent,
});

function RouteComponent() {
  const onTrackingNumberChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  return (
    <>
      <Hero image={deliveryTrackingImg} className="h-screen  md:h-full">
        <div className="mx-auto flex w-full flex-col items-center gap-4 pt-32 text-center md:mx-0 md:w-2/3 md:items-start md:pt-24 md:text-start lg:w-1/2">
          <h1 className="text-4xl leading-none tracking-tight text-white lg:text-5xl">
            Track Your Delivery
          </h1>
          <p className="mb-8 text-sm font-normal text-gray-300 lg:text-lg">
            Enter your tracking number to get the latest updates on your
            delivery.
          </p>
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-white bg-white/20 p-8">
            <input
              onChange={onTrackingNumberChanged}
              required
              id="tracking-number"
              maxLength={20}
              className="block w-full rounded-xl border border-gray-300 bg-gray-200 p-3 text-center text-lg tracking-widest text-black focus:border-red-400 focus:outline-none focus:ring-transparent"
              placeholder="Tracking Number"
            />
            <button className="rounded-xl bg-black/90 px-4 py-2 text-white">
              Track Now
            </button>
          </div>
        </div>
      </Hero>
      <div
        className="bg-black bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8)), url('${home2Logo}')`,
        }}
      >
        <FAQ />
      </div>
      <AppFooter />
    </>
  );
}
