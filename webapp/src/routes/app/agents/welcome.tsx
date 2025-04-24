import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
// import { MobileButton } from "../../../components/mobile/mobileButton";
// import Logo from "@/assets/images/splash-screen-logo.png";
import AgentOnboard from "@/assets/images/agent-onboard.png";

function WelcomeScreen() {
  return (
    <div className="min-h-screen bg-mobile-background font-mobile flex flex-col">
      {/* Logo and Illustration Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {/* Logo */}
        {/* <div className="flex flex-col items-center space-y-2">
          <img src={Logo} alt="Logo" className="w-24 h-24" />
          <span className="text-mobile-text text-lg">driver</span>
        </div> */}

        {/* Illustration */}
        <div className="w-full max-w-sm aspect-square bg-[#F2E7D8] rounded-2xl p-6 flex items-center justify-center relative overflow-hidden">
          <img 
            src={AgentOnboard} 
            alt="Agent Onboarding" 
            className="w-full h-full object-contain"
          />
         
        </div>

        {/* Welcome Text */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-mobile-text">Welcome to</h1>
          <h2 className="text-2xl font-semibold text-mobile-text">Snap Driver App</h2>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="p-6 flex flex-row gap-4">
        <Link
          to="/app/agents/signin"
          className="flex-1 bg-stone-500 text-mobile-text py-3 px-6 rounded-2xl font-medium text-center"
        >
          Sign In
        </Link>
        <Link
          to="/app/agents/register"
          className="flex-1 border border-mobile-text text-mobile-text py-3 px-6 rounded-2xl font-medium text-center"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/welcome")({
  component: WelcomeScreen,
}); 