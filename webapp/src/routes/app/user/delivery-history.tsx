import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

interface DeliveryHistoryItem {
  id: string;
  date: string;
  courierName: string;
  rating: number;
  status: "completed" | "cancelled";
  address: string;
}

const mockDeliveries: DeliveryHistoryItem[] = [
  {
    id: "1",
    date: "2024-03-20",
    courierName: "Allan Smith",
    rating: 4.5,
    status: "completed",
    address: "123 Market St, San Francisco, CA"
  },
  {
    id: "2",
    date: "2024-03-19",
    courierName: "John Doe",
    rating: 5,
    status: "completed",
    address: "456 Mission St, San Francisco, CA"
  },
  {
    id: "3",
    date: "2024-03-18",
    courierName: "Sarah Wilson",
    rating: 0,
    status: "cancelled",
    address: "789 Howard St, San Francisco, CA"
  }
];

function DeliveryHistoryScreen() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow">
        <h1 className="text-xl font-semibold">Delivery History</h1>
      </div>

      {/* Delivery List */}
      <div className="p-4 space-y-4">
        {mockDeliveries.map((delivery) => (
          <Link
            key={delivery.id}
            to="/app/user/delivery-details/$deliveryId"
            params={{ deliveryId: delivery.id }}
            className="block bg-white rounded-xl p-4 shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-sm text-gray-500">{delivery.date}</div>
                <div className="font-medium">{delivery.courierName}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                delivery.status === "completed" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-2">{delivery.address}</div>

            {delivery.status === "completed" && (
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-sm text-gray-600">{delivery.rating}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/user/delivery-history")({
  component: DeliveryHistoryScreen,
}); 