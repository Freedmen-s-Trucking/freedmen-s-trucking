import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
// import logo from "~/assets/images/logo.webp";
// import snapLogo from "~/assets/images/new-logo.jpeg";
import { MobileButton } from "../../../components/mobile/mobileButton";
const SignUpScreen = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add signup logic here
  };

  return (
    <div className="mx-auto flex h-screen max-w-[375px] flex-col text-mobile-text px-6 font-mobile bg-mobile-background">
      {/* Logo section */}
      <div className="mt-16 flex items-center justify-center">
        {/* <img 
          src={snapLogo} 
          alt="Snap Logo" 
          className="h-[70px] w-[100px]"
        /> */}
        {/* <span className="ml-2 text-2xl font-bold text-[#1a2b3c]">Snap</span> */}
      </div>

      {/* Welcome text */}
      <div className="mt-[41px]">
        <h1 className="text-[20px] font-semibold text-black">Let's get started</h1>
        <p className="mt-[3px] text-[12px] text-gray-600">Please input your details</p>
      </div>

      {/* Sign up form */}
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col">
        {/* Name inputs */}
        <div className="mb-4 flex gap-4">
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            placeholder="First name"
            className="w-[154px] h-[50px] flex-1 rounded-lg border border-gray-200 bg-mobile-background px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            placeholder="Last name"
            className="w-[154px] h-[50px] flex-1 rounded-lg border border-gray-200 bg-mobile-background px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Phone number input */}
        <div className="mb-4 flex">
          <div className="relative flex-none">
            <select className="h-full rounded-lg border border-gray-200 bg-mobile-background px-2 py-3.5 pr-6 text-gray-900">
              <option value="NG">🇳🇬</option>
              <option value="US">🇺🇸</option>
              <option value="CA">🇨🇦</option>
              <option value="AU">🇦🇺</option>
              <option value="NZ">🇳🇿</option>
              <option value="ZA">🇿🇦</option>
              <option value="GH">🇬🇭</option>
              <option value="KE">🇰🇪</option>
              
              {/* Add more country options */}
            </select>
          </div>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            placeholder="Your phone number"
            className="flex-1 rounded-lg  border border-gray-200 bg-mobile-background px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Email input */}
        <div className="mb-4">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Your email"
            className="w-full rounded-lg bg-mobile-background px-4 py-3.5 border border-gray-200 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Password input */}
        <div className="mb-6">
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Your password"
            className="w-full rounded-lg bg-mobile-background px-4 py-3.5 border border-gray-200 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Continue button */}
        <MobileButton 
          isPrimary={true} 
          text="Continue" 
          link="/app/user/verify"
        />

        {/* Terms and Privacy */}
        <p className="mb-6 text-center text-sm text-gray-600">
          By signing up, you agree to snap{' '}
          <Link  to="/" className="font-medium underline">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/" className="font-medium underline">Privacy Policy</Link>
        </p>

        {/* Sign in link */}
        <div className="text-center text-[14px]">
          <span className="text-gray-600">Already had an account? </span>
          <Link
            to="/app/user/signin"
            className="font-semibold text-mobile-text"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export const Route = createFileRoute("/app/user/signup")({
  component: SignUpScreen,
});