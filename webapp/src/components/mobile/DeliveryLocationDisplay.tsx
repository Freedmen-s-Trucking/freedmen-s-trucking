import { MapPin } from 'lucide-react';

interface DeliveryLocationDisplayProps {
  pickupLocation: string;
  deliveryLocation: string;
}

export const DeliveryLocationDisplay = ({
  pickupLocation,
  deliveryLocation,
}: DeliveryLocationDisplayProps) => {
  return (
    <div className="flex flex-col gap-4 font-mobile">
      {/* Pickup Location */}
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-red-500" />
          </div>
          <div className="w-[2px] h-full bg-gray-200" />
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Pickup Location</span>
          <span className="text-base font-medium">{pickupLocation}</span>
        </div>
      </div>

      {/* Delivery Location */}
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Delivery Location</span>
          <span className="text-base font-medium">{deliveryLocation}</span>
        </div>
      </div>
    </div>
  );
}; 