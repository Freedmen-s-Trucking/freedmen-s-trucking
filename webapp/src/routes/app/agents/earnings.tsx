import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoChevronForward, IoChevronBack as IoChevronLeft } from "react-icons/io5";
import { useNavigate } from "@tanstack/react-router";
import { IoHome, IoWallet, IoCalendar, IoPerson } from "react-icons/io5";

function EarningsScreen() {
  const navigate = useNavigate();

  const handleSeeDetails = () => {
    navigate({ to: "/app/agents/earnings-details" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b">
        <button
          onClick={() => window.history.back()}
          className="text-gray-700"
        >
          <IoChevronBack className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium">Earnings</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Date Selector */}
        <div className="flex items-center justify-between">
          <button className="text-teal-600">
            <IoChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-gray-900 font-medium">Dec 14 - Dec 21</span>
          <button className="text-teal-600">
            <IoChevronForward className="w-6 h-6" />
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="bg-teal-50 rounded-xl p-4">
          <div className="text-sm text-gray-600">Current Balance (₦)</div>
          <div className="text-3xl font-semibold mt-1">750.45</div>
          <div className="text-sm text-gray-600 mt-2">As at Dec 18</div>
        </div>

        {/* Next Payout Info */}
        <div className="text-sm text-gray-600">
          Next Payout due on Dec 21, 2020
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Time</span>
            <span className="text-gray-900">42 Hours 32 Minutes</span>
          </div>
          <div className="border-t border-gray-100"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Deliveries</span>
            <span className="text-gray-900">38</span>
          </div>
        </div>

        {/* See Details Button */}
        <button
          onClick={handleSeeDetails}
          className="w-full text-teal-600 font-medium py-2"
        >
          See Details
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center gap-1 px-4 text-gray-400">
            <IoHome className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 text-teal-600">
            <IoWallet className="w-6 h-6" />
            <span className="text-xs">Earnings</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 text-gray-400">
            <IoCalendar className="w-6 h-6" />
            <span className="text-xs">Bookings</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 text-gray-400">
            <IoPerson className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/earnings")({
  component: EarningsScreen,
}); 