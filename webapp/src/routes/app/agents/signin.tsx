import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { IoChevronBack } from "react-icons/io5";
import LoginAgent from "~/assets/images/login-agent.png";

function SignInScreen() {
  return (
    <div className="min-h-screen bg-mobile-background font-mobile">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <Link
          to="/app/agents/welcome"
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <IoChevronBack className="w-6 h-6" />
        </Link>
      </div>

      <div className="p-6 flex flex-col h-[calc(100vh-64px)]">
        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm aspect-video relative">
            <img 
              src={LoginAgent} 
              alt="Login" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-mobile-text">Welcome Back</h1>
            <p className="text-mobile-text opacity-80">Please input your information</p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-[#F2E7D8] text-mobile-text px-4 py-3 rounded-2xl outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#F2E7D8] text-mobile-text px-4 py-3 rounded-2xl outline-none"
            />
          </div>

          <button
            onClick={() => window.location.href = '/app/agents/home'}
            className="w-full bg-stone-500 text-mobile-text py-3 px-6 rounded-2xl font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/signin")({
  component: SignInScreen,
}); 