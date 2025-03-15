import React from "react";
import herologo from "../../assets/hero.webp";
import AppNavbar from "../organisms/navbar";
import { Link } from "@tanstack/react-router";

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
      <div
        className="hero-section bg-cover bg-fixed bg-center bg-no-repeat px-4 py-8 md:px-8 md:py-16 "
        style={{ backgroundImage: `url('${herologo}')` }}
      >
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
            <p className="mb-8 text-xs font-normal text-gray-300 lg:text-lg">
              Fast, reliable, and efficient truck dispatching services tailored
              to your needs.
            </p>

            <Link
              to={"/schedule-delivery"}
              className="focus:outline-hidden inline-flex items-center gap-x-2 rounded-3xl border border-white px-4 py-3 text-sm font-medium text-white hover:border-red-400 hover:text-red-400 focus:border-red-400 focus:text-red-400"
            >
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
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
