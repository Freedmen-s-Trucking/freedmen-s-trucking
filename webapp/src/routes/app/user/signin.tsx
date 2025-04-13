import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/images/logo.webp"; // Update with your Snap logo path

const SignInScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your sign-in logic here
  };

  return (
    <div className="mx-auto flex h-screen max-w-[375px] flex-col bg-white px-6">
      {/* Logo section */}
      <div className="mt-16 flex items-center">
        <img 
          src={logo} 
          alt="Snap Logo" 
          className="h-10 w-10"
        />
        <span className="ml-2 text-2xl font-bold text-[#1a2b3c]">Snap</span>
      </div>

      {/* Welcome text */}
      <div className="mt-12">
        <h1 className="text-2xl font-semibold text-black">Welcome</h1>
        <p className="mt-2 text-gray-600">Please input your details</p>
      </div>

      {/* Sign in form */}
      <form onSubmit={handleSignIn} className="mt-8 flex flex-col">
        {/* Email input */}
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="youremailaddress@address.com"
            className="w-full rounded-lg bg-gray-50 px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Password input */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-gray-50 px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#1a2b3c]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Forgot Password link */}
        <div className="mb-6 text-right">
          <Link
            to="/app/user/onboarding"
            


            className="text-sm font-medium text-[#1a2b3c]"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign in button */}
        <button
          type="submit"
          className="mb-6 rounded-lg bg-[#2A6877] py-4 text-center text-lg font-semibold text-white"
        >
          Get Started
        </button>

        {/* Sign up link */}
        <div className="text-center">
          <span className="text-gray-600">Need an account? </span>
          <Link
            to="/app/user/onboarding"

            className="font-semibold text-[#2A6877]"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};

export const Route = createFileRoute("/app/user/signin")({
//   beforeLoad({ context }) {
//     // Redirect if user is already authenticated
//     if (context.user?.isAnonymous === false) {
//       throw redirect({
//         to: "/app/customer/dashboard",
//       });
//     }
//   },
  component: SignInScreen,
}); 