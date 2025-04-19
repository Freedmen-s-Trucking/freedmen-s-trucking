import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "../../../components/mobile/back-button";
import { RiderAvatar } from "../../../components/mobile/RiderAvatar";
import { DeliveryLocationDisplay } from "../../../components/mobile/DeliveryLocationDisplay";
import { Bike } from "lucide-react";

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

function ArriveLocationScreen() {
  return (
    <div className="min-h-screen bg-mobile-background font-mobile">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-4">
        <BackButton isPrimary={true} mainText="Delivery Details" />
      </div>

      <div className="px-6 space-y-6">
        {/* Vehicle Type Indicator */}
        <div className="absolute top-8 right-6">
          <div className="w-12 h-12 bg-[#F4F9F8] rounded-xl flex items-center justify-center">
            <Bike className="w-6 h-6 text-teal-700" />
          </div>
        </div>

        {/* Courier Info */}
        <RiderAvatar
          name={mockDelivery.courierName}
          deliveryCount={mockDelivery.deliveriesCount}
          rating={mockDelivery.rating}
          imageUrl="https://randomuser.me/api/portraits/men/32.jpg"
        />

        {/* Locations */}
        <div className="mb-8">
          <DeliveryLocationDisplay
            pickupLocation={mockDelivery.pickupLocation}
            deliveryLocation={mockDelivery.deliveryLocation}
          />
        </div>

        {/* Package Details */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <div className="text-sm text-gray-500">What you are sending</div>
              <div className="text-mobile-text">{mockDelivery.itemType}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Recipient</div>
              <div className="text-mobile-text">{mockDelivery.recipientName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Recipient contact number</div>
              <div className="text-mobile-text">{mockDelivery.recipientPhone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Payment</div>
              <div className="text-mobile-text">{mockDelivery.paymentMethod}</div>
            </div>
          </div>

          {/* Estimated Fee */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-500">Estimated fee:</div>
            <div className="text-xl font-semibold text-mobile-text">${mockDelivery.fee}</div>
          </div>
        </div>

        {/* Image Placeholders */}
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-2">Pickup image(s)</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-[#F4F9F8] rounded-xl"></div>
              <div className="aspect-square bg-[#F4F9F8] rounded-xl"></div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-2">Delivery image(s)</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-[#F4F9F8] rounded-xl"></div>
              <div className="aspect-square bg-[#F4F9F8] rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/user/arrive-location")({
  component: ArriveLocationScreen,
}); 