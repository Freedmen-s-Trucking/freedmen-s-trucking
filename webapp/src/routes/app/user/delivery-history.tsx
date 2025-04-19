import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { BackButton } from "../../../components/mobile/back-button";
import { OrderCard } from "../../../components/mobile/order-card";

interface DeliveryHistoryItem {
  id: string;
  date: string;
  recipient: string;
  status: "Completed" | "Pending";
  location: string;
  expectedTime?: string;
  timestamp?: string;
}

const mockDeliveries: DeliveryHistoryItem[] = [
  {
    id: "ORDB1234",
    date: "2024-03-20",
    recipient: "Paul Pogba",
    status: "Pending",
    location: "21b, Karimu Kotun Street, Victoria Island",
    expectedTime: "20 mins"
  },
  {
    id: "ORDB1235",
    date: "2024-03-19",
    recipient: "Paul Pogba",
    status: "Completed",
    location: "Maryland bustop, Anthony Ikeja",
    timestamp: "12 January 2020, 2:43pm"
  },
  {
    id: "ORDB1236",
    date: "2024-03-18",
    recipient: "Paul Pogba",
    status: "Completed",
    location: "Maryland bustop, Anthony Ikeja",
    timestamp: "12 January 2020, 2:43pm"
  }
];

function DeliveryHistoryScreen() {
  return (
    <div className="min-h-screen bg-mobile-background font-mobile">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-4">
        <BackButton isPrimary={true} mainText="Delivery History" />
      </div>

      {/* Delivery List */}
      <div className="px-6 space-y-4">
        {mockDeliveries.map((delivery) => (
          <Link
            key={delivery.id}
            to="/app/user/delivery-details/$deliveryId"
            params={{ deliveryId: delivery.id }}
          >
            <OrderCard
              orderId={delivery.id}
              recipient={delivery.recipient}
              location={delivery.location}
              status={delivery.status}
              timestamp={delivery.timestamp}
              expectedTime={delivery.expectedTime}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/user/delivery-history")({
  component: DeliveryHistoryScreen,
}); 