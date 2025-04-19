import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack } from "react-icons/io5";

interface DeliveryDetails {
  id: string;
  courierName: string;
  rating: number;
  pickupLocation: string;
  deliveryLocation: string;
  itemType: string;
  recipientName: string;
  recipientPhone: string;
  paymentMethod: string;
  fee: number;
}

const deliveryDetails: DeliveryDetails = {
  id: "1",
  courierName: "Davidson Edgar",
  rating: 4.1,
  pickupLocation: "32 Samwell Sq, Chevron",
  deliveryLocation: "21b, Karimu Kotun Street, Victoria Island",
  itemType: "Electronics/Gadgets",
  recipientName: "Donald Duck",
  recipientPhone: "08123456789",
  paymentMethod: "Card",
  fee: 150
};

function DeliveryDetailsScreen() {
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
        <h1 className="text-xl font-medium">Delivery details</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Courier Info */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm">DE</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-medium">{deliveryDetails.courierName}</span>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-sm text-gray-600">{deliveryDetails.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Pickup Location</div>
              <div className="font-medium">{deliveryDetails.pickupLocation}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Delivery Location</div>
              <div className="font-medium">{deliveryDetails.deliveryLocation}</div>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500">What you are sending</div>
            <div className="font-medium">{deliveryDetails.itemType}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Recipient</div>
            <div className="font-medium">{deliveryDetails.recipientName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Recipient contact number</div>
            <div className="font-medium">{deliveryDetails.recipientPhone}</div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Payment</div>
              <div className="font-medium">{deliveryDetails.paymentMethod}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Fee:</div>
              <div className="font-medium">${deliveryDetails.fee}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-xl">
            Reject
          </button>
          <button className="flex-1 px-4 py-3 text-white bg-teal-600 rounded-xl">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/delivery-details")({
  component: DeliveryDetailsScreen,
}); 