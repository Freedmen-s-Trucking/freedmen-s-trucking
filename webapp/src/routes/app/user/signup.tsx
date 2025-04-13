import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/images/logo.webp";

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
        <h1 className="text-2xl font-semibold text-black">Let's get started</h1>
        <p className="mt-2 text-gray-600">Please input your details</p>
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
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            placeholder="Last name"
            className="flex-1 rounded-lg bg-gray-50 px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Phone number input */}
        <div className="mb-4 flex">
          <div className="relative flex-none">
            <select className="h-full rounded-lg border-r border-gray-200 bg-gray-50 px-2 py-3.5 pr-6 text-gray-900">
              <option value="NG">🇳🇬</option>
              {/* Add more country options */}
            </select>
          </div>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            placeholder="Your phone number"
            className="flex-1 rounded-lg rounded-l-none bg-gray-50 px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Email input */}
        <div className="mb-4">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Your email"
            className="w-full rounded-lg bg-gray-50 px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Password input */}
        <div className="mb-6">
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Your password"
            className="w-full rounded-lg bg-gray-50 px-4 py-3.5 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Continue button */}
        <button
          type="submit"
          className="mb-6 rounded-lg bg-[#2A6877] py-4 text-center text-lg font-semibold text-white"
        >
          Continue
        </button>

        {/* Terms and Privacy */}
        <p className="mb-6 text-center text-sm text-gray-600">
          By signing up, you agree to snap{' '}
          <Link  to="/" className="font-medium underline">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/" className="font-medium underline">Privacy Policy</Link>
        </p>

        {/* Sign in link */}
        <div className="text-center">
          <span className="text-gray-600">Already had an account? </span>
          <Link
            to="/app/user/signin"
            className="font-semibold text-[#2A6877]"
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