import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { IoChevronBack } from "react-icons/io5";
import { useState } from "react";

function RegisterFormScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    referralCode: '',
    agreeToTerms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-mobile-background font-mobile">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <Link
          to="/app/agents/register"
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <IoChevronBack className="w-6 h-6" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col h-[calc(100vh-64px)]">
        {/* Title Section */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-mobile-text">Let's get Started</h1>
          <p className="text-mobile-text opacity-80">Please input your information</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              className="bg-[#F2E7D8] text-mobile-text px-4 py-3 rounded-2xl outline-none w-full"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              className="bg-[#F2E7D8] text-mobile-text px-4 py-3 rounded-2xl outline-none w-full"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            className="bg-[#F2E7D8] text-mobile-text px-4 py-3 rounded-2xl outline-none w-full"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            className="bg-[#F2E7D8] text-mobile-text px-4 py-3 rounded-2xl outline-none w-full"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="bg-[#F2E7D8] text-mobile-text px-4 py-3 rounded-2xl outline-none w-full"
          />

          <select
            name="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="bg-[#F2E7D8] text-mobile-text px-4 py-3 rounded-2xl outline-none w-full appearance-none"
          >
            <option value="" disabled>City</option>
            <option value="lagos">Lagos</option>
            <option value="abuja">Abuja</option>
            <option value="port-harcourt">Port Harcourt</option>
          </select>

          <input
            type="text"
            name="referralCode"
            placeholder="Referral Code (Optional)"
            value={formData.referralCode}
            onChange={handleInputChange}
            className="bg-[#F2E7D8] text-mobile-text px-4 py-3 rounded-2xl outline-none w-full"
          />

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="mt-1"
            />
            <label className="text-sm text-mobile-text">
              By checking this box, you agree to our{' '}
              <Link to="/" className="text-red-500">Terms & Conditions</Link>
              . That all information provided is true and Snap or its representatives may contact me via any of the provided channels.
            </label>
          </div>
        </div>

        <Link 
          to="/app/agents/agent-otp"
          className={
            !formData.agreeToTerms ? "pointer-events-none" : ""
          }
        >
          <button
            type="submit"
            disabled={!formData.agreeToTerms}
            className={
              formData.agreeToTerms
                ? "w-full py-3 px-6 rounded-2xl font-medium bg-stone-500 text-mobile-text mt-6"
                : "w-full py-3 px-6 rounded-2xl font-medium bg-stone-500/50 text-mobile-text/50 mt-6"
            }
          >
            Continue
          </button>
        </Link>
      </form>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/register-form")({
  component: RegisterFormScreen,
}); 