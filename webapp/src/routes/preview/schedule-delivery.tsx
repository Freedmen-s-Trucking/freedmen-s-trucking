import { createFileRoute, redirect } from "@tanstack/react-router";
import { UserEntity } from "@freedman-trucking/types";
import home2LogoBlured from "@/assets/images/home-2-blur.webp";
import home2Logo from "@/assets/images/home-2.webp";
import Hero from "@/components/molecules/hero";
import FAQ from "@/components/molecules/faq";
import AppFooter from "@/components/organisms/footer";
import scheduleDeliveryHeroImg from "@/assets/images/schedule-delivery-hero.webp";
import scheduleDeliveryHeroImgBlured from "@/assets/images/schedule-delivery-hero-blur.webp";
import { AppImageBackground } from "@/components/atoms/image-background";
import { useAuth } from "@/hooks/use-auth";
import { CreateOrderForm } from "@/components/molecules/create-order";

export const Route = createFileRoute("/preview/schedule-delivery")({
  beforeLoad({ context }) {
    if (!context.remoteConfigs.canShowPreviewLandingPage) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: RouteComponent,
});

const contacts = [
  {
    label: "Phone",
    Value: ({
      user,
      ...other
    }: { user: UserEntity } & Record<string, unknown>) => (
      <>
        <input {...other} readOnly type="text" value={user.phoneNumber || ""} />
      </>
    ),
  },
  {
    label: "Email",
    Value: ({
      user,
      ...other
    }: { user: UserEntity } & Record<string, unknown>) => (
      <>
        <input {...other} readOnly type="email" value={user.email || ""} />
      </>
    ),
  },
  {
    label: "Adress",
    Value: ({
      user,
      ...other
    }: { user: UserEntity } & Record<string, unknown>) => (
      <>
        <input {...other} readOnly type="text" value={user && "???"} />
      </>
    ),
  },
];

function RouteComponent() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <>
      <Hero
        image={scheduleDeliveryHeroImg}
        bluredImage={scheduleDeliveryHeroImgBlured}
        className="min-h-screen"
      >
        <div className="flex flex-col items-center justify-center px-4 pt-16 sm:px-12 lg:flex-row">
          <div className="mx-auto mb-8 w-[min(100%,350px)]  max-w-md bg-black/80 px-8 py-8 md:mx-0 md:mb-0 md:w-full">
            <h2 className="text-center text-4xl font-bold text-white md:text-start">
              Schedule Your Delivery
            </h2>
            <p className="py-4 text-center text-sm text-white md:text-start">
              Enter your details to get started.
            </p>
            {user.isAnonymous && (
              <div className="flex flex-col items-center justify-center gap-4">
                <button
                  onClick={signInWithGoogle}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-black"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-5 w-5"
                  />
                  Sign in with Google
                </button>
              </div>
            )}
            {!user.isAnonymous &&
              contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex w-full flex-row items-center justify-between text-white"
                >
                  <span>{contact.label}:</span>
                  <contact.Value
                    user={user.info}
                    className="inline rounded-sm border-none bg-transparent p-0 text-end text-white focus:border-none focus:outline-none focus:ring-0"
                  />
                </div>
              ))}
          </div>
          <div className="w-full min-w-96 max-w-md overflow-hidden rounded-2xl bg-gradient-to-r from-[rgba(102,102,102,0.6)] to-[rgba(0,0,0,0.6)]">
            <CreateOrderForm brightness="dark" />
          </div>
        </div>
      </Hero>
      <AppImageBackground
        className="bg-scroll"
        src={home2Logo}
        placeholder={home2LogoBlured}
        customGradient="linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8))"
      >
        <FAQ />
      </AppImageBackground>
      <AppFooter />
    </>
  );
}
