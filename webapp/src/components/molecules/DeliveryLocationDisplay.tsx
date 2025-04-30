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
    <div className="space-y-4">
      {/* Pickup Location */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <MapPin className="w-5 h-5 text-red-500" />
          <div className="w-[1px] h-4 bg-gray-200" />
        </div>
        <div>
          <div className="text-sm text-gray-500">Pickup Location</div>
          <div className="text-gray-900">{pickupLocation}</div>
        </div>
      </div>

      {/* Delivery Location */}
      <div className="flex gap-3">
        <div className="w-5 h-5 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full border-2 border-green-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Delivery Location</div>
          <div className="text-gray-900">{deliveryLocation}</div>
        </div>
      </div>
    </div>
  );
}; 