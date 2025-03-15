import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import AppNavbar from "../components/arena/navbar";
import herologo from "../assets/hero.png.webp";
import home2Logo from "../assets/home-2.png.webp";
import home3Logo from "../assets/home-3.png.webp";

export const Route = createFileRoute("/")({
  component: Index,
});

const Hero: React.FC = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector(".hero-section");
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        setIsScrolled(rect.bottom <= 80);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="w-100 inset-0 mx-auto h-screen max-w-screen-xl">
        <div
          className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 md:relative ${isScrolled ? "bg-gray-900" : "bg-transparent"}`}
        >
          <AppNavbar />
        </div>
        <div className="mx-auto w-full pt-56 text-center md:mx-0 md:w-2/3 md:pt-24 md:text-start">
          <h1 className="mb-4 text-5xl font-extrabold leading-none tracking-tight text-white md:text-6xl lg:text-6xl">
            Same-Day Delivery, Simplified.
          </h1>
          <hr className="mx-auto my-3 w-1/2 md:mx-0 md:w-4/5"></hr>
          <p className="lg:text-md mb-8 text-xs font-normal text-gray-300">
            Fast, reliable, and efficient truck dispatching services tailored to
            your needs.
          </p>
          <button className="focus:outline-hidden inline-flex items-center gap-x-2 rounded-3xl border border-white px-4 py-3 text-sm font-medium text-white hover:border-blue-700 hover:text-blue-700 focus:border-blue-700 focus:text-blue-700">
            Schedule Delivery
            <svg
              width="17"
              height="18"
              viewBox="0 0 17 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-current"
            >
              <path d="M8.5 17.5C3.8 17.5 0 13.7 0 9C0 4.3 3.8 0.5 8.5 0.5C13.2 0.5 17 4.3 17 9C17 13.7 13.2 17.5 8.5 17.5ZM8.5 1.5C4.35 1.5 1 4.85 1 9C1 13.15 4.35 16.5 8.5 16.5C12.65 16.5 16 13.15 16 9C16 4.85 12.65 1.5 8.5 1.5Z" />
              <path d="M8.34999 13.85L7.64999 13.15L11.8 9.00002L7.64999 4.85002L8.34999 4.15002L13.2 9.00002L8.34999 13.85Z" />
              <path d="M4 8.5H12.5V9.5H4V8.5Z" />
            </svg>
          </button>{" "}
        </div>{" "}
      </div>
    </>
  );
};
const WhyUs: React.FC = () => {
  const WHY_US_TITLE = "Why Choose Us";

  const WHY_US_SECTIONS = [
    {
      title: "Fast Delivery",
      description: "Your packages delivered on time, every time.",
    },
    {
      title: "Affordable Rates",
      description:
        "Your packages delivered on time, every timeTransparent pricing without hidden fees.",
    },
    {
      title: "Reliable Tracking",
      description: "Track your shipment every step of the way.",
    },
    {
      title: "24/7 Support",
      description: "We're here to help, anytime.",
    },
  ];

  return (
    <div className="py-10">
      <h1 className="mb-4 text-center text-5xl font-extrabold text-gray-900 underline underline-offset-2 md:text-6xl lg:text-6xl">
        {WHY_US_TITLE}
      </h1>
      <div className="columns-1 gap-4 pt-4 md:columns-2 lg:columns-4">
        {WHY_US_SECTIONS.map((section, index) => (
          <div
            key={index}
            className="w-100 mx-auto mb-8 aspect-square max-w-96 rounded-full border-2 border-red-400 p-2"
          >
            <div className="h-full items-center rounded-full bg-gray-900">
              <i className="fas fa-truck"></i>
              <h3>{section.title}</h3>
              <hr />
              <p>{section.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OurSpecialty: React.FC = () => {
  const SPECIALTIES_TITLE = "Our Specialities";

  const SPECIALTIES_DATA = [
    {
      title: "Box Truck",
      description: 'Any type of 26\'L+ * 96"W * 96"H (10K lbs+) trucks with LG',
    },
    {
      title: "Dry Van",
      description: "Any type of 48'-53' trucks",
    },
    {
      title: "Reefer",
      description: "Any type of trailer",
    },
    {
      title: "Power Only",
      description: "Both Day Cabs and OTR units",
    },
    {
      title: "Hotshot",
      description: "Any type of 40'L+ (15K lbs+) trucks",
    },
    {
      title: "Flatbed",
      description: "Any type of 48'-53' (45K lbs+) trucks",
    },
  ];
  return (
    <div>
      <h1 className="mb-4 text-5xl font-extrabold leading-none tracking-tight text-white md:text-6xl lg:text-6xl">
        {SPECIALTIES_TITLE}
      </h1>
      <div>
        {SPECIALTIES_DATA.map((specialty, index) => (
          <div key={index}>
            <i className="fas fa-truck"></i>
            <h3>
              {specialty.title}{" "}
              <svg
                width="62"
                height="62"
                viewBox="0 0 62 62"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M40.903 20.3808L25.5113 20.5929M40.903 20.3808L41.1151 35.7725M40.903 20.3808L27.6208 34.0341M20.6635 41.1858L23.8259 37.935"
                  stroke="#B21F25"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </h3>
            <hr />
            <p>{specialty.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Prices: React.FC = () => {
  const PRICES_TITLE = "Prices for the Truck Dispatch Service";
  const PRICES_DATA = [
    {
      title: "Your Authority",
      description:
        "Price for our truck dispatch services starts from 5% gross revenue and up depending on your equipment: ",
      lists: [
        "Box truck - 10%",
        "Hotshot - 5% ",
        "Flatbed/StepDeck - 5%",
        "Dry Van/Reefer/Power Only - 5%",
      ],
    },
    {
      title: "Our Authority",
      description:
        "Price for freight services under our MC authority starts from 15% gross revenue and up. You will get:",
      list: [
        `Our MC Authority`,
        `Insurance & Safety`,
        `24/7 Dispatch Support`,
        `Document Management and other Benefits.`,
      ],
    },
  ];
  return (
    <div>
      <h2>{PRICES_TITLE}</h2>
      <div>
        {PRICES_DATA.map((price, index) => (
          <div key={index}>
            <h3>{price.title}</h3>
            <hr />
            <p>{price.description}</p>
            <ul>
              {price.lists?.map((list, index) => <li key={index}>{list}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const TESTIMONIALS_DATA = [
    {
      name: "John S.",
      href: "https://www.linkedin.com/in/john-s-674623252/",
      quote:
        "I've been using this service for a while now, and it's been a game-changer for my business. The team is responsive, and the rates are competitive. Highly recommended!",
    },
    {
      name: "Jane Smith",
      href: "https://www.linkedin.com/in/john-s-674623252/",
      quote:
        "I was skeptical at first, but the service exceeded my expectations. The tracking is accurate, and the customer support is top-notch. I'll definitely be using them again.",
    },
  ];
  return (
    <div>
      <h4>Testimonials</h4>
      <h2>Our Happy Clients</h2>
      <p>
        Here's what our customers are saying about us:We understand you might
        have questions about our inpatient treatment program. Here are some of
        the most common inquiries.
      </p>
      <div>
        {TESTIMONIALS_DATA.map((testimonial, index) => (
          <div key={index}>
            <h3>{testimonial.name}</h3>
            <p>{testimonial.quote}</p>
            <a href={testimonial.href}>LinkedIn Profile</a>
          </div>
        ))}
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <div>
      <h2>FAQ</h2>
      <p>Here are some frequently asked questions:</p>
    </div>
  );
};

const ImportantLinksAndSubscription: React.FC = () => {
  return (
    <div>
      <h2>Important Links and Subscription</h2>
      <p>
        Here are some important links and subscription options for our services:
      </p>
    </div>
  );
};

function Index() {
  return (
    <>
      <div
        className="hero-section bg-cover bg-fixed bg-center bg-no-repeat px-4 py-8 md:px-8 md:py-16 "
        style={{ backgroundImage: `url('${herologo}')` }}
      >
        <Hero />
      </div>
      <div
        className="bg-cover bg-no-repeat  px-4 py-8 md:px-8 md:py-16"
        style={{ backgroundImage: `url('${home2Logo}')` }}
      >
        <WhyUs />
        <OurSpecialty />
        <Prices />
        <Testimonials />
        <FAQ />
      </div>
      <div
        className="bg-cover bg-no-repeat "
        style={{ backgroundImage: `url('${home3Logo}')` }}
      >
        <ImportantLinksAndSubscription />
      </div>
    </>
  );
}
