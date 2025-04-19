import { createFileRoute } from "@tanstack/react-router";
import { IoHomeOutline, IoCalendarOutline, IoPersonOutline } from "react-icons/io5";

interface DeliveryRequest {
  id: string;
  type: string;
  price: number;
  distance: string;
  estimatedTime: string;
}

function HomeScreen() {
  const deliveryRequests: DeliveryRequest[] = [
    {
      id: "1",
      type: "Electronics/Gadgets",
      price: 20.45,
      distance: "2.5 km",
      estimatedTime: "15-20 min"
    },
    {
      id: "2",
      type: "Food Items/Groceries",
      price: 15.00,
      distance: "1.8 km",
      estimatedTime: "10-15 min"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-gray-500">Welcome Back</div>
            <div className="text-lg font-medium">Allan Smith</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm">DE</span>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-teal-50 rounded-xl p-4 mb-6">
          <div className="text-sm text-gray-600 mb-1">Available Balance</div>
          <div className="text-2xl font-semibold text-teal-700">$0</div>
        </div>

        {/* Available Requests */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium">Available Requests</h2>
            <button className="text-sm text-teal-600">View all</button>
          </div>
          
          <div className="space-y-4">
            {deliveryRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                  <div>
                    <div className="text-sm font-medium">{request.type}</div>
                    <div className="text-xs text-gray-500">{request.distance} • {request.estimatedTime}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-medium">${request.price.toFixed(2)}</div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">
                      Reject
                    </button>
                    <button className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg">
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center text-teal-600">
            <IoHomeOutline className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <IoCalendarOutline className="w-6 h-6" />
            <span className="text-xs mt-1">History</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <IoPersonOutline className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/home")({
  component: HomeScreen,
}); 