import { IoChevronBack, IoBicycle } from "react-icons/io5";

interface DeliveryDetails {
  id: string;
  courierName: string;
  deliveriesCount: number;
  rating: number;
  status: "completed" | "cancelled" | "in-progress";
  pickupLocation: string;
  deliveryLocation: string;
  itemType: string;
  recipientName: string;
  recipientPhone: string;
  paymentMethod: string;
  fee: number;
}

const mockDelivery: DeliveryDetails = {
  id: "1",
  courierName: "Allan Smith",
  deliveriesCount: 124,
  rating: 4.1,
  status: "completed",
  pickupLocation: "32 Samwell Sq, Chevron",
  deliveryLocation: "21b, Karimu Kotun Street, Victoria Island",
  itemType: "Electronics/Gadgets",
  recipientName: "Donald Duck",
  recipientPhone: "08123456789",
  paymentMethod: "Card",
  fee: 150
};

interface DeliveryDetailsScreenProps {
  onBack?: () => void;
}

export function DeliveryDetailsScreen({ onBack }: DeliveryDetailsScreenProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b">
        <button
          onClick={onBack}
          className="text-gray-700"
        >
          <IoChevronBack className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium">Delivery details</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Courier Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-medium">{mockDelivery.courierName}</span>
              <span className="text-sm text-gray-500">{mockDelivery.deliveriesCount} Deliveries</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4].map((star) => (
                <svg
                  key={star}
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-gray-500">{mockDelivery.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
              Completed
            </span>
            <IoBicycle className="w-5 h-5 text-gray-600" />
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
              <div className="font-medium">{mockDelivery.pickupLocation}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Delivery Location</div>
              <div className="font-medium">{mockDelivery.deliveryLocation}</div>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500">What you are sending</div>
            <div className="font-medium">{mockDelivery.itemType}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Receipient</div>
            <div className="font-medium">{mockDelivery.recipientName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Receipient contact number</div>
            <div className="font-medium">{mockDelivery.recipientPhone}</div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Payment</div>
              <div className="font-medium">{mockDelivery.paymentMethod}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Fee:</div>
              <div className="font-medium">${mockDelivery.fee}</div>
            </div>
          </div>
        </div>

        {/* Image Placeholders */}
        <div>
          <div className="text-sm text-gray-500 mb-2">Pickup image(s)</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-square bg-gray-100 rounded-lg"></div>
            <div className="aspect-square bg-gray-100 rounded-lg"></div>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 mb-2">Delivery image(s)</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-square bg-gray-100 rounded-lg"></div>
            <div className="aspect-square bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 