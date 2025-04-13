import { createFileRoute,  Link } from "@tanstack/react-router";
import { useState } from "react";
import splashScreen from "@/assets/images/splash-screen-logo.png";
import onBoardingImage from "@/assets/images/user-image-1.png";

const onboardingSteps = [
  {
    title: "Request for Delivery\nin few clicks",
    description: "On-demand delivery whenever and\nwherever the need arises.",
    image: onBoardingImage
  },
  // Add more steps if needed
];

const OnboardingScreen = () => {
  const [currentStep] = useState(0);

  return (
    <div className="mx-auto flex h-screen max-w-[375px] flex-col bg-black">
      {/* Background Image with Overlay */}
      <div className="relative h-full w-full">
        <img
          src={onboardingSteps[currentStep].image}
          alt="Background"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col p-6">
          {/* Top section with logo */}
          <div className="mt-8 flex items-center">
            <img 
              src={splashScreen} 
              alt="Snap Logo" 
              className="h-8 w-8"
            />
            <span className="ml-2 text-2xl font-bold text-white">Snap</span>
          </div>

          {/* Middle section with text */}
          <div className="mt-auto mb-24 text-white">
            <h1 className="mb-4 text-4xl font-bold leading-tight">
              Request for Delivery<br />in few clicks
            </h1>
            <p className="text-lg leading-relaxed opacity-90">
              On-demand delivery whenever and<br />wherever the need arises.
            </p>
          </div>

          {/* Bottom section with buttons and indicators */}
          <div className="mb-8">
            {/* Progress dots */}
            <div className="mb-8 flex space-x-2">
              <div className="h-1.5 w-8 rounded-full bg-white" />
              <div className="h-1.5 w-8 rounded-full bg-white/30" />
              <div className="h-1.5 w-8 rounded-full bg-white/30" />
            </div>

            {/* Get Started button */}
            <button className="mb-6 w-full rounded-lg bg-[#00B4D8] py-4 text-center text-lg font-semibold text-white">
              Get Started
            </button>

            {/* Sign in link */}
            <div className="text-center text-white">
              Have an account already?{" "}
              <Link
                to="/app/user/splash-screen"
                // to="/auth/signin"
                className="font-semibold uppercase text-white underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/app/user/onboarding")({
//   beforeLoad({ context }) {
//     if (context.user?.isAnonymous === false) {
//       throw redirect({
//         to: "/app/customer/dashboard",
//       });
//     }
//   },
  component: OnboardingScreen,
}); 