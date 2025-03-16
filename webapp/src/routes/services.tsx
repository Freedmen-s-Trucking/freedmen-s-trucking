import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import home2Logo from "../assets/home-2.webp";
import aboutUsTruck from "../assets/about-us-truck-1.webp";
import ourservicehero from "../assets/our-services-hero.webp";
import Hero from "../components/molecules/hero";
import FAQ from "../components/molecules/faq";
import AppFooter from "../components/organisms/footer";
import { AppImage } from "../components/atoms/image";
import { SPECIALTIES_DATA } from "../utils/constants";
import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
  Flowbite,
} from "flowbite-react";

const ACCORDION_THEME = {
  theme: {
    accordion: {
      root: {
        base: "",
        flush: {
          off: "",
          on: "",
        },
      },
      content: {
        base: "border-b-0 border-transparent p-1 py-2 text-white",
      },
      title: {
        open: {
          on: "border-b-0 p-1 text-red-500", //"bg-red-500 text-white",
        },
        flush: {
          off: "border-b border-transparent p-1 text-white",
          on: "",
        },
      },
    },
  },
};
export const Route = createFileRoute("/services")({
  component: RouteComponent,
});

const BoxTruckSection: React.FC = () => {
  const {
    location: { search },
  } = useRouterState();
  const currentSpecialtySKU =
    (search as Record<string, string>).specialty || SPECIALTIES_DATA[0].sku;
  const currentSpecialty =
    SPECIALTIES_DATA.find((s) => s.sku === currentSpecialtySKU) ||
    SPECIALTIES_DATA[0];

  const isActive = (sku: string) => currentSpecialtySKU === sku;
  return (
    <div className="w-100 inset-0 mx-auto my-8 max-w-screen-xl md:my-12">
      <div className="flex flex-col gap-8 px-4 sm:px-12 md:flex-row md:justify-start md:gap-4">
        <div className="columns-3 md:columns-2">
          {SPECIALTIES_DATA.map((specialty, index) => (
            <Link
              to="/services"
              disabled={isActive(specialty.sku)}
              search={(prev: Record<string, unknown>) => ({
                ...prev,
                specialty: specialty.sku,
              })}
              key={index}
              className={`mb-2 flex h-20 w-full min-w-[100px] flex-row gap-1  self-center justify-self-center border-[1px] bg-white/80 p-2 md:h-32 md:w-[138px] md:flex-col md:px-4 lg:h-36 lg:w-[180px] ${isActive(specialty.sku) ? "border-red-400 opacity-70" : "border-gray-700"}`}
            >
              <AppImage
                className={`m-0 h-5 w-5 self-center sm:h-8 sm:w-8 md:h-12 md:w-12 lg:h-16 lg:w-16`}
                src={specialty.iconPath}
                alt={specialty.title}
              />
              <div className="flex flex-1 flex-row items-center justify-evenly">
                <h2
                  className={`text-center text-xs md:text-sm md:font-bold lg:text-lg`}
                >
                  {specialty.title}
                </h2>
                <span
                  className={`pb-2 text-center text-3xl md:px-2 ${isActive(specialty.sku) ? "rotate-45" : ""}`}
                >
                  &#8594;
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="relative mb-4 w-full">
          <AppImage
            className="absolute mb-4 h-full min-w-full max-w-none opacity-70 lg:object-cover xl:w-full"
            src={currentSpecialty.serviceImage}
            placeholder={currentSpecialty.serviceImageBlur}
            alt={currentSpecialty.title}
          />

          <div className="relative flex flex-col gap-5 pb-4 pl-8 pt-8 lg:mr-8 lg:gap-8 lg:pl-16">
            <h2 className="text-3xl font-bold text-white lg:text-5xl">
              {currentSpecialty.title}
            </h2>
            <AppImage
              className="m-0 h-12 w-12 invert md:h-16 md:w-16"
              src={currentSpecialty.iconPath}
              alt={currentSpecialty.title}
            />
            <p className="text-sm font-normal text-white lg:text-[16px]">
              {currentSpecialty.details}
            </p>
            <div className="flex sm:gap-5 md:order-2">
              <Link
                to={"/schedule-delivery"}
                type="button"
                className="focus:outline-hidden inline-flex items-center gap-x-2 rounded-3xl border border-white px-4 py-3 text-sm font-medium text-white hover:border-red-400 hover:text-red-400 focus:border-red-400 focus:text-red-400 disabled:pointer-events-none disabled:opacity-50 "
              >
                {currentSpecialty.actionLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WhatBoxTrunckIncludeSection: React.FC = () => {
  const WhatBoxTrunckTitle = "What Does Truck Dispatching Include?";
  const keyComponentsOfTruckDispatching = [
    {
      title: "Route Planning and Optimization",
      details:
        "Strategically selecting the best routes to ensure timely deliveries and fuel efficiency.Avoiding high-traffic zones and road closures to minimize delays.",
    },
    {
      title: "Load Matching",
      details:
        "Efficiently pairing available trucks with suitable freight loads based on capacity, location, and scheduling requirements. Ensuring optimal utilization of fleet resources.",
    },
    {
      title: "Real-Time Tracking and Monitoring",
      details:
        "Using advanced GPS and telematics systems to monitor vehicle locations, delivery progress, and driver performance. Providing instant updates and alerts for any delays or issues.",
    },
    {
      title: "Driver Support and Communication",
      details:
        "Maintaining constant communication with drivers to address concerns, provide assistance, and relay important updates. Ensuring compliance with hours of service regulations and safety protocols.",
    },
    {
      title: "Document Management",
      details:
        "Handling all necessary paperwork including bills of lading, proof of delivery, permits, and customs documentation. Maintaining organized digital records for easy access and compliance.",
    },
    {
      title: "Customer Coordination",
      details:
        "Managing client relationships, providing regular updates on shipment status, and addressing any concerns or special requirements. Ensuring clear communication between shippers and receivers.",
    },
    {
      title: "Fleet Management",
      details:
        "Overseeing vehicle maintenance schedules, compliance requirements, and resource allocation. Optimizing fleet performance and minimizing downtime through preventive maintenance.",
    },
  ];
  return (
    <div className="bg-black/50 px-4 py-8 md:px-8 md:py-16">
      <div className="w-100 inset-0 mx-auto max-w-screen-xl">
        <h1 className="mb-4 text-center text-3xl font-bold uppercase text-white underline underline-offset-4 md:text-4xl">
          {WhatBoxTrunckTitle.split(" ").map((word, index) => (
            <span key={index}>
              <span className="text-[1.2em]">{word[0]}</span>
              {word.substring(1)}{" "}
            </span>
          ))}
        </h1>
        <div className="columns-1 gap-2 px-4 py-16 md:columns-2 md:gap-12">
          <div className="inline-block">
            <div className="rounded-3xl">
              <AppImage src={aboutUsTruck} alt="our truck" className="w-full" />
            </div>
            <p className="pt-4 text-center text-sm text-white md:text-start">
              Truck dispatching is a comprehensive service that ensures the
              seamless coordination and execution of freight deliveries. From
              managing logistics to offering support throughout the delivery
              process, dispatchers are the backbone of efficient trucking
              operations. Here's an overview of what truck dispatching typically
              includes:
            </p>
          </div>
          <div className="mx-auto mt-8 w-full max-w-md overflow-hidden">
            <Flowbite theme={ACCORDION_THEME}>
              <Accordion>
                {keyComponentsOfTruckDispatching.map((keyComponent, index) => (
                  <AccordionPanel isOpen={index == 0} key={index}>
                    <AccordionTitle>
                      <span className="text-xl">•</span>
                      {keyComponent.title}
                    </AccordionTitle>
                    <AccordionContent>
                      <p className="mb-2 text-sm">{keyComponent.details}</p>
                    </AccordionContent>
                  </AccordionPanel>
                ))}
              </Accordion>
            </Flowbite>
          </div>
        </div>
      </div>
    </div>
  );
};
function RouteComponent() {
  return (
    <>
      <Hero image={ourservicehero}>
        <div className="mx-auto flex w-full flex-col items-center gap-4 pt-56 text-center md:mx-0 md:w-2/3 md:items-start md:pt-24 md:text-start lg:w-1/2">
          <h1 className="text-5xl font-extrabold leading-none tracking-tight text-white md:text-6xl lg:text-6xl">
            Our Services
          </h1>
          <hr className="mx-auto my-3 w-1/2 md:mx-0 md:w-4/5"></hr>
          <p className="mb-8 text-sm font-normal text-gray-300 lg:text-lg">
            Resolute Logistics Company was founded in 2017 in New York, NY;
            furthermore, its founders have 15-year working experience in
            Logistics and Finance and its processing, and getting paid on time.
          </p>
        </div>
      </Hero>
      <div
        className="bg-black bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8)), url('${home2Logo}')`,
        }}
      >
        <div className=" overflow-hidden px-4 py-8 md:px-8 md:py-16">
          <BoxTruckSection />
          <WhatBoxTrunckIncludeSection />
        </div>
        <FAQ />
      </div>
      <AppFooter />
    </>
  );
}
