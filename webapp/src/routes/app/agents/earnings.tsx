import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoChevronForward, IoChevronBack as IoChevronLeft } from "react-icons/io5";
import { useNavigate } from "@tanstack/react-router";
import { MobileButton } from "../../../components/mobile/mobileButton";
import { MobileBottomBar } from "../../../components/mobile/mobile-bottom-bar";

function EarningsScreen() {
  const navigate = useNavigate();

  const handleSeeDetails = () => {
    navigate({ to: "/app/agents/earnings-details" });
  };

  return (
    <div className="min-h-screen bg-mobile-background font-mobile flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-200">
          <button
            onClick={() => window.history.back()}
            className="text-mobile-text"
          >
            <IoChevronBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-mobile text-mobile-text">Earnings</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Date Selector */}
          <div className="flex items-center justify-between">
            <button className="text-mobile-text">
              <IoChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-mobile-text font-medium">Dec 14 - Dec 21</span>
            <button className="text-mobile-text">
              <IoChevronForward className="w-6 h-6" />
            </button>
          </div>

          {/* Current Balance Card */}
          <div className="bg-mobile-text border border-mobile-text rounded-xl p-4">
            <div className="text-sm text-white">Current Balance (₦)</div>
            <div className="text-3xl font-semibold text-white mt-1">750.45</div>
            <div className="text-sm text-white mt-2">As at Dec 18</div>
          </div>

          {/* Next Payout Info */}
          <div className="text-sm text-gray-600">
            Next Payout due on Dec 21, 2020
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time</span>
              <span className="text-mobile-text">42 Hours 32 Minutes</span>
            </div>
            <div className="border-t border-gray-200"></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Deliveries</span>
              <span className="text-mobile-text">38</span>
            </div>
          </div>

          {/* See Details Button */}
          <MobileButton
            isPrimary={true}
            text="See Details"
            onClick={handleSeeDetails}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomBar isAgent={true} />
    </div>
  );
}

export const Route = createFileRoute("/app/agents/earnings")({
  component: EarningsScreen,
}); 