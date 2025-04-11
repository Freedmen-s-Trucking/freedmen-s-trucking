import { createFileRoute, redirect } from "@tanstack/react-router";
import aboutUsHeroImg from "~/assets/images/about-us-hero.webp";
import aboutUsHeroImgBlured from "~/assets/images/about-us-hero-blur.webp";
import home2Logo from "~/assets/images/home-2.webp";
import home2LogoBlured from "~/assets/images/home-2-blur.webp";
import Hero from "~/components/molecules/hero";
import Testimonials from "~/components/molecules/testimonials";
import FAQ from "~/components/molecules/faq";
import AppFooter from "~/components/organisms/footer";
import aboutUsTruck from "~/assets/images/about-us-truck-1.webp";
import { AppImage } from "~/components/atoms";
import { AppImageBackground } from "~/components/atoms";

export const Route = createFileRoute("/preview/about")({
  beforeLoad({ context }) {
    if (!context.remoteConfigs.canShowPreviewLandingPage) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: About,
});
const AboutUsSection: React.FC = () => {
  return (
    <div className="w-100 inset-0 mx-auto my-8 max-w-screen-xl md:my-12">
      <h1 className="mb-4 text-center text-4xl font-extrabold uppercase text-[#12151A] underline decoration-2 underline-offset-[16px] md:text-5xl">
        About Us
      </h1>
      <div className="flex flex-col gap-8 px-4 py-16 sm:px-12 md:flex-row md:items-start md:justify-center lg:gap-24 lg:pt-16">
        <div className="rounded-3xl border-2 border-black p-2">
          <AppImage src={aboutUsTruck} alt="our truck" className="w-full" />
        </div>
        <div className="w-full md:w-1/2">
          <p className="text-sm font-normal text-[#12151A] lg:text-lg">
            Resolute Logistics Company was founded in 2017 in New York, NY;
            furthermore, its founders have 15-year working experience in
            Logistics and Finance markets of the USA, Canada and Europe. The aim
            of the company is to make the drivers' life easier when they are on
            the road and help them solve recurring issues that are connected
            with cargo transportation, paperwork and its processing, and getting
            paid on time.
          </p>
        </div>
      </div>
    </div>
  );
};

const AboutTeamSection: React.FC = () => {
  const TEAM_MEMBERS = [
    {
      Image: ({ className }: { className?: string }) => (
        <AppImage
          src="/images/team-member-1.webp"
          placeholder="/images/team-member-1-blur.webp"
          className={className}
          alt="Man"
        />
      ),
    },
    {
      Image: ({ className }: { className?: string }) => (
        <AppImage
          src="/images/team-member-2.webp"
          placeholder="/images/team-member-2-blur.webp"
          className={className}
          alt="Woman"
        />
      ),
    },
    {
      Image: ({ className }: { className?: string }) => (
        <AppImage
          src="/images/team-member-3.webp"
          placeholder="/images/team-member-3-blur.webp"
          className={className}
          alt="Man"
        />
      ),
    },
  ];
  return (
    <div className="w-100 inset-0 mx-auto my-8 max-w-screen-xl md:my-16">
      <h1 className="mb-4 text-center text-4xl font-extrabold text-[#12151A] underline decoration-2 underline-offset-[16px] md:text-5xl">
        About Team
      </h1>
      <div className="px-4 py-16 sm:px-12">
        <p className="text-center">
          Today our company has over 50 experienced Dispatchers that are split
          into mini-teams. Every mini-team has its Team Leader who provides
          coordination, control and development of employees. Such a working
          model allows them to cooperate efficiently within the team, providing
          quick response to personal requests of our clients and keeping top
          quality
        </p>
        <div className="flex flex-col items-center gap-8 pt-10 md:flex-row md:justify-center">
          {TEAM_MEMBERS.map((member, index) => (
            <member.Image
              key={index}
              className="mb-8 h-6 w-4/5 max-w-xs rounded-xl border-[1px] border-red-400 p-2  md:max-w-[200px] lg:max-w-[250px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function About() {
  return (
    <>
      <Hero image={aboutUsHeroImg} bluredImage={aboutUsHeroImgBlured}>
        <div className="mx-auto flex w-full flex-col items-center gap-4 pt-56 text-center md:mx-0 md:w-2/3 md:items-start md:pt-24 md:text-start lg:w-1/2">
          <h1 className="text-5xl font-extrabold leading-none tracking-tight text-white md:text-6xl lg:text-6xl">
            About Us
          </h1>
          <hr className="mx-auto my-3 w-1/2 md:mx-0 md:w-4/5"></hr>
          <p className="mb-8 w-4/5 text-sm font-normal text-gray-300 md:w-full lg:text-lg">
            Resolute Logistics Company was founded in 2017 in New York, NY;
            furthermore, its founders have 15-year working experience in
            Logistics and Finance and its processing, and getting paid on time.
          </p>
        </div>
      </Hero>
      <AppImageBackground
        className="bg-scroll"
        src={home2Logo}
        placeholder={home2LogoBlured}
        customGradient="linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8))"
      >
        <div className=" px-4 py-8 md:px-8 md:py-16">
          <AboutUsSection />
          <AboutTeamSection />
          <Testimonials />
        </div>
        <FAQ />
      </AppImageBackground>
      <AppFooter />
    </>
  );
}
