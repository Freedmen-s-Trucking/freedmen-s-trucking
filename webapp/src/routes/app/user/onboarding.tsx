import { createFileRoute,  Link } from "@tanstack/react-router";
import { useState } from "react";
// import snapLogo from "@/assets/images/snap-logo.png";
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
    <div className="mx-auto flex h-screen max-w-[375px] flex-col bg-black font-mobile">
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
          <div className="mt-8 flex items-center w-full  justify-center">
            {/* <img 
              src={snapLogo} 
              alt="Snap Logo" 
              className="w-[41px] h-[41px]"
            /> */}
            {/* <span className="ml-2 text-2xl font-bold text-white">Snap</span> */}
          </div>

          {/* Middle section with text */}
          <div className="mt-auto mb text-white ">
            <h1 className="mb-4 text-[30px] font-bold leading-tight">
              Request for Delivery<br />in few clicks
            </h1>
            <p className="text-[16px] leading-relaxed opacity-90">
              On-demand delivery whenever and<br />wherever the need arises.
            </p>
          </div>

          {/* Bottom section with buttons and indicators */}
          <div className="my-8 flex flex-col items-center justify-center">
            {/* Progress dots */}
            <div className="mb-8 flex space-x-2">
              <div className="h-1.5 w-[24px] rounded-full bg-white" />
              <div className="h-1.5 w-[12px] rounded-full bg-white/30" />
              <div className="h-1.5 w-[12px] rounded-full bg-white/30" />
            </div>

            {/* Get Started button */}
            <Link to="/app/user/signup" className="w-full">
              <button className="mb-6 w-full bg-mobile-button text-white rounded-lg  py-4 text-center text-[16px] font-semibold ">
                Get Started
              </button>
            </Link>

            {/* Sign in link */}
            <div className="text-center text-white text-[14px]">
              Have an account already?{" "}
              <Link
                to="/app/user/signin"
                // to="/auth/signin"
                className="font-semibold uppercase text-white underline text-[14px]"
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