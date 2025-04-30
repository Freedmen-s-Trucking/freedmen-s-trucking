import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { RequestCard } from "../../../components/mobile/request-card";
import { MobileBottomBar } from "~/components/mobile/mobile-bottom-bar";
import { MobileTopBar } from "~/components/mobile/mobile-top-bar";

// Mock data for available requests
const mockRequests = [
  {
    id: "1",
    itemType: "Electronics/Gadgets",
    recipient: "Paul Pogba",
    location: "Maryland bustop, Anthony Ikeja",
  },
  {
    id: "2",
    itemType: "Electronics/Gadgets",
    recipient: "Paul Pogba",
    location: "21b, Karimu Kotun Street, Victoria Island",
  }
];

function AgentHomeScreen() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const navigate = useNavigate();

  const handleAccept = () => {
    navigate({ to: "/app/agents/delivery-details" });
  };

  const handleReject = () => {
    // Handle request rejection
    console.log('Request rejected');
  };

  const handleViewAll = () => {
    // Since the route is not yet registered in the router, we'll just log for now
    console.log('Viewing all requests');
    // TODO: Add proper navigation once route is registered
  };

  return (
    <div className="min-h-screen bg-mobile-background font-mobile pb-20">
      <MobileTopBar />
      
      {/* Balance Card */}
      <div className="px-6">
        <div className="bg-[#F2E7D8] rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[14px] text-mobile-text opacity-60">Balance</span>
            <button onClick={() => setIsBalanceVisible(!isBalanceVisible)}>
              {isBalanceVisible ? (
                <EyeOff className="w-5 h-5 text-mobile-text opacity-60" />
              ) : (
                <Eye className="w-5 h-5 text-mobile-text opacity-60" />
              )}
            </button>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[24px] font-semibold text-mobile-text">
              {isBalanceVisible ? "₦50,000" : "****"}
            </span>
            <span className="text-[14px] text-mobile-text opacity-60">.00</span>
          </div>
        </div>

        {/* Available Requests */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-medium text-mobile-text">Available Requests</h2>
            <button 
              className="text-[14px] text-mobile-text"
              onClick={handleViewAll}
            >
              View all
            </button>
          </div>

          <div className="space-y-4">
            {mockRequests.map((request) => (
              <RequestCard
                key={request.id}
                itemType={request.itemType}
                recipient={request.recipient}
                location={request.location}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar isAgent={true} />
    </div>
  );
}

export const Route = createFileRoute("/app/agents/home")({
  component: AgentHomeScreen,
}); 