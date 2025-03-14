import { createFileRoute } from "@tanstack/react-router";
import AppNavbar from "../components/arena/navbar";

export const Route = createFileRoute("/")({
  component: Index,
});

const Hero: React.FC = () => {
  return (
    <div>
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
  return (
    <div>
      <h2>Why Choose Us</h2>
      <div>
        <div>
          <i className="fas fa-truck"></i>
          <h3>Fast Delivery</h3>
          <hr />
          <p>Your packages delivered on time, every time.</p>
        </div>
        <div>
          <i className="fas fa-truck"></i>
          <h3>Affordable Rates</h3>
          <hr />
          <p>
            Your packages delivered on time, every timeTransparent pricing
            without hidden fees.
          </p>
        </div>
        <div>
          <i className="fas fa-truck"></i>
          <h3>Reliable Tracking</h3>
          <hr />
          <p>Track your shipment every step of the way.</p>
        </div>
        <div>
          <i className="fas fa-truck"></i>
          <h3>24/7 Support</h3>
          <hr />
          <p>We're here to help, anytime.</p>
        </div>
      </div>
      <p>We are a family-owned and operated business that has</p>
    </div>
  );
};

const OurSpecialty: React.FC = () => {
  return (
    <div>
      <h2>Our Specialities</h2>
      <div>
        <div>
          <i className="fas fa-truck"></i>
          <h3>
            Box Truck{" "}
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
          <p>Any type of 26'L+ * 96"W * 96"H (10K lbs+) trucks with LG</p>
        </div>
        <div>
          <i className="fas fa-truck"></i>
          <h3>
            Dry Van{" "}
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
          <p>Any type of 48’-53’ trucks</p>
        </div>
        <div>
          <i className="fas fa-truck"></i>
          <h3>
            Reefer{" "}
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
          <p>Any type of trailer</p>
        </div>
        <div>
          <i className="fas fa-truck"></i>
          <h3>
            Power Only{" "}
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
          <p>Both Day Cabs and OTR units</p>
        </div>
        <div>
          <i className="fas fa-truck"></i>
          <h3>
            Hotshot{" "}
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
          <p>Any type of 40’L+ (15K lbs+) trucks</p>
        </div>
        <div>
          <i className="fas fa-truck"></i>
          <h3>
            Flatbed{" "}
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
          <p>Any type of 48’-53’ (45K lbs+) trucks</p>
        </div>
      </div>
    </div>
  );
};

const Prices: React.FC = () => {
  return (
    <div>
      <h2>Prices</h2>
      <p>We offer competitive pricing for our services.</p>
    </div>
  );
};

const Testimonials: React.FC = () => {
  return (
    <div>
      <h2>Testimonials</h2>
      <p>Here's what our customers are saying about us:</p>
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
