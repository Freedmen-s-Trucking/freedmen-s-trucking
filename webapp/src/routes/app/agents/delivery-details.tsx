import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { IoArrowBack } from "react-icons/io5";
import { MapPin, Circle, Star } from "lucide-react";
import { MobileBottomBar } from "@/components/mobile/mobile-bottom-bar";

function DeliveryDetailsScreen() {
  const navigate = useNavigate();

  const handleAccept = () => {
    navigate({ to: "/app/agents/request-details" });
  };

  return (
    <div className="min-h-screen bg-mobile-background font-mobile text-mobile-text flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="px-6 pt-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/app/agents/home" className="text-mobile-text">
              <IoArrowBack className="w-6 h-6" />
            </Link>
            <h1 className="text-[20px] font-semibold">Delivery details</h1>
          </div>

          {/* Agent Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F2E7D8] flex items-center justify-center text-[18px]">
                DE
              </div>
              <div>
                <h2 className="text-[16px] font-medium">Davidson Edgar</h2>
                <p className="text-[14px] opacity-60">20 Deliveries</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((star) => (
                <Star key={star} className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
              ))}
              <Star className="w-4 h-4 stroke-yellow-400" />
              <span className="ml-1 text-[14px]">4.1</span>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-4 mb-8">
            <div>
              <p className="text-[14px] opacity-60 mb-2">Pickup Location</p>
              <div className="p-4 bg-[#F2E7D8] rounded-2xl flex items-center gap-3">
                <MapPin className="w-5 h-5 stroke-red-600" />
                <span className="text-[14px]">32 Samwell Sq, Chevron</span>
              </div>
            </div>

            <div>
              <p className="text-[14px] opacity-60 mb-2">Delivery Location</p>
              <div className="p-4 bg-[#F2E7D8] rounded-2xl flex items-center gap-3">
                <Circle className="w-5 h-5 stroke-green-600" />
                <span className="text-[14px]">21b, Karimu Kotun Street, Victoria Island</span>
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-4 mb-8">
            <div>
              <p className="text-[14px] opacity-60 mb-2">What you are sending</p>
              <div className="p-4 bg-[#F2E7D8] rounded-2xl">
                <span className="text-[14px]">Electronics/Gadgets</span>
              </div>
            </div>

            <div>
              <p className="text-[14px] opacity-60 mb-2">Receipient</p>
              <div className="p-4 bg-[#F2E7D8] rounded-2xl">
                <span className="text-[14px]">Donald Duck</span>
              </div>
            </div>

            <div>
              <p className="text-[14px] opacity-60 mb-2">Receipient contact number</p>
              <div className="p-4 bg-[#F2E7D8] rounded-2xl">
                <span className="text-[14px]">08123456789</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-[14px] opacity-60 mb-2">Payment</p>
                <div className="p-4 bg-[#F2E7D8] rounded-2xl">
                  <span className="text-[14px]">Card</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[14px] opacity-60 mb-2">Fees</p>
                <div className="p-4 bg-[#F2E7D8] rounded-2xl">
                  <span className="text-[14px]">$150</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Images */}
          <div className="mb-8">
            <p className="text-[14px] opacity-60 mb-2">Pickup image(s)</p>
            <div className="flex gap-2">
              <div className="w-20 h-20 bg-[#F2E7D8] rounded-xl"></div>
              <div className="w-20 h-20 bg-[#F2E7D8] rounded-xl"></div>
            </div>
          </div>

          {/* View Map Route */}
          <button className="w-full text-center text-[16px] text-[#37948F] mb-8">
            View Map Route
          </button>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button className="flex-1 py-4 rounded-2xl bg-mobile-background border border-mobile-text text-mobile-text font-medium">
              Reject
            </button>
            <button 
              onClick={handleAccept}
              className="flex-1 py-4 rounded-2xl bg-mobile-text text-white font-medium"
            >
              Accept
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar isAgent={true} />
    </div>
  );
}

export const Route = createFileRoute("/app/agents/delivery-details")({
  component: DeliveryDetailsScreen,
}); 