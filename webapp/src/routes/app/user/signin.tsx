import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
// import snapLogo from "~/assets/images/splash-screen-logo.png";

const SignInScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your sign-in logic here
  };

  return (
    <div className="mx-auto flex h-screen max-w-[375px] flex-col bg-mobile-background text-mobile-text font-mobile px-6">
      {/* Logo section */}
      <div className="mt-16 flex items-center justify-center">
        {/* <img 
          src={snapLogo} 
          alt="Snap Logo" 
          className="h-[41px] w-[108px]"
        /> */}
      </div>

      {/* Welcome text */}
      <div className="mt-[41px]">
        <h1 className="text-[20px] font-semibold text-black">Welcome</h1>
        <p className="mt-[3px] text-[12px] text-gray-600">Please input your details</p>
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
            className="w-full rounded-lg bg-mobile-background px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Password input */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-mobile-background px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
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
        <Link to="/app/user/home" className="w-full">
        <button
          type="submit"
          className="mb-6 w-full rounded-lg bg-mobile-button py-4 text-center text-[16px] font-semibold text-white"
        >
          Get Started
        </button>
        </Link>
       

        {/* Sign up link */}
        <div className="text-center text-[14px]">
          <span className="text-gray-600">Need an account? </span>
          <Link
            to="/app/user/signup"

            className="font-semibold text-mobile-text"
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