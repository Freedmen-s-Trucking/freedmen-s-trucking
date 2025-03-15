import { createFileRoute } from "@tanstack/react-router";
import home2Logo from "../assets/home-2.webp";
import Hero from "../components/molecules/hero";
import Testimonials from "../components/molecules/testimonials";
import FAQ from "../components/molecules/faq";
import AppFooter from "../components/organisms/footer";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <>
      <Hero />
      <div
        className="bg-black bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8)), url('${home2Logo}')`,
        }}
      >
        <div className=" px-4 py-8 md:px-8 md:py-16">
          {/* <WhyUs />
          <OurSpecialty />
          <Prices /> */}
          <Testimonials />
        </div>
        <FAQ />
      </div>
      <AppFooter />
    </>
  );
}
