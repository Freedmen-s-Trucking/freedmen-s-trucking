import { createFileRoute } from "@tanstack/react-router";
import { RequestCard } from "../../../components/mobile/request-card";
import { useNavigate } from "@tanstack/react-router";
import { MobileBottomBar } from "~/components/mobile/mobile-bottom-bar";

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

function AvailableRequestsScreen() {
  const navigate = useNavigate();

  const handleAccept = (requestId: string) => {
    console.log(requestId)
    // Navigate to delivery details or start delivery process
    navigate({ to: "/app/agents/delivery-details" });
  };

  const handleReject = (requestId: string) => {
    // Handle request rejection
    console.log('Rejected request:', requestId);
  };

  return (
    <div className="min-h-screen bg-mobile-background font-mobile pb-20">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-semibold text-mobile-text">Available Requests</h1>
      </div>

      {/* Request List */}
      <div className="px-6 space-y-4">
        {mockRequests.map((request) => (
          <RequestCard
            key={request.id}
            itemType={request.itemType}
            recipient={request.recipient}
            location={request.location}
            onAccept={() => handleAccept(request.id)}
            onReject={() => handleReject(request.id)}
          />
        ))}
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar isAgent={true} />
    </div>
  );
}

export const Route = createFileRoute("/app/agents/available-requests")({
  component: AvailableRequestsScreen,
}); 