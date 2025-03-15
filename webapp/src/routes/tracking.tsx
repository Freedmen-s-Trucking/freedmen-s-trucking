import { createFileRoute } from "@tanstack/react-router";
import home2Logo from "../assets/home-2.webp";
import Hero from "../components/molecules/hero";
import FAQ from "../components/molecules/faq";
import AppFooter from "../components/organisms/footer";

export const Route = createFileRoute("/tracking")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Hero />
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
