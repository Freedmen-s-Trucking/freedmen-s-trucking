import { createFileRoute } from "@tanstack/react-router";
import AppNavbar from "../components/arena/navbar";
import herologo from "../assets/hero.png.webp";

export const Route = createFileRoute("/")({
  component: Index,
});

const Hero: React.FC = () => {
  return (
    <div style={{ backgroundImage: `url('${herologo}')` }}>
      <AppNavbar />
      <h1>Same-Day Delivery, Simplified.</h1>
      <p>
        Fast, reliable, and efficient truck dispatching services tailored to
        your needs.
      </p>
      <button className="focus:outline-hidden inline-flex items-center gap-x-2 rounded-3xl border border-gray-800 px-4 py-3 text-sm font-medium text-gray-800 hover:border-gray-500 hover:text-gray-500 focus:border-gray-500 focus:text-gray-500 disabled:pointer-events-none disabled:opacity-50 ">
        Schedule Delivery
        <svg
          width="17"
          height="18"
          viewBox="0 0 17 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.5 17.5C3.8 17.5 0 13.7 0 9C0 4.3 3.8 0.5 8.5 0.5C13.2 0.5 17 4.3 17 9C17 13.7 13.2 17.5 8.5 17.5ZM8.5 1.5C4.35 1.5 1 4.85 1 9C1 13.15 4.35 16.5 8.5 16.5C12.65 16.5 16 13.15 16 9C16 4.85 12.65 1.5 8.5 1.5Z"
            fill="white"
          />
          <path
            d="M8.34999 13.85L7.64999 13.15L11.8 9.00002L7.64999 4.85002L8.34999 4.15002L13.2 9.00002L8.34999 13.85Z"
            fill="white"
          />
          <path d="M4 8.5H12.5V9.5H4V8.5Z" fill="white" />
        </svg>
      </button>
    </div>
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

  const COMPANY_DESCRIPTION =
    "We are a family-owned and operated business that has";

  return (
    <div>
      <h2>{WHY_US_TITLE}</h2>
      <div>
        {WHY_US_SECTIONS.map((section, index) => (
          <div key={index}>
            <i className="fas fa-truck"></i>
            <h3>{section.title}</h3>
            <hr />
            <p>{section.description}</p>
          </div>
        ))}
      </div>
      <p>{COMPANY_DESCRIPTION}</p>
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
      <h2>{SPECIALTIES_TITLE}</h2>
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
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
      <Hero />
      <WhyUs />
      <OurSpecialty />
      <Prices />
      <Testimonials />
      <FAQ />
      <ImportantLinksAndSubscription />
    </>
  );
}
