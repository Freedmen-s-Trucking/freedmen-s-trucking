import { createFileRoute } from "@tanstack/react-router";
import { IoArrowBack } from "react-icons/io5";
import { Link } from "@tanstack/react-router";
import { DeliveryMap } from "../../../components/molecules/delivery-map";
import { useState } from "react";

// interface DeliveryLocation {
//   address: string;
//   label?: string;
// }

interface Position {
  lat: number;
  lng: number;
}

function InstantDeliveryScreen() {
  const [pickupLocation] = useState<Position>({ lat: 6.4550, lng: 3.3841 }); // Lagos coordinates
  const [deliveryLocation, setDeliveryLocation] = useState<Position | null>(null);

  const handleMapClick = (position: Position) => {
    if (!deliveryLocation) {
      setDeliveryLocation(position);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Map Section */}
      <div className="relative h-[60vh] bg-gray-100">
        {/* Back Button */}
        <Link to="/app/user/home" 
          className="absolute top-12 left-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
          <IoArrowBack className="w-6 h-6" />
        </Link>
        
        <DeliveryMap
          center={pickupLocation}
          markers={[pickupLocation, ...(deliveryLocation ? [deliveryLocation] : [])]}
          onMapClick={handleMapClick}
        />
      </div>
      

      {/* Delivery Form */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-8 px-6 pt-8">
        <h1 className="text-2xl font-semibold mb-6">Instant Delivery</h1>
        
        {/* Pickup Location */}
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Pickup Location</label>
          <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
            <span className="text-red-500">📍</span>
            <span>32 Samwell Sq, Chevron</span>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Delivery Location</label>
          <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
            <span className="text-green-500">📍</span>
            <span>21b, Karimu Kotun Street, Victoria Island</span>
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="mb-8">
          <label className="block text-gray-600 mb-3">Vehicle Type</label>
          <div className="grid grid-cols-3 gap-4">
            <button className="p-4 bg-teal-100 rounded-xl flex flex-col items-center gap-2">
              <span className="text-2xl">🛵</span>
              <span className="text-sm">Bike</span>
            </button>
            <button className="p-4 bg-gray-50 rounded-xl flex flex-col items-center gap-2">
              <span className="text-2xl">🚗</span>
              <span className="text-sm">Car</span>
            </button>
            <button className="p-4 bg-gray-50 rounded-xl flex flex-col items-center gap-2">
              <span className="text-2xl">🚚</span>
              <span className="text-sm">Van</span>
            </button>
          </div>
        </div>

        {/* Next Button */}
        <button className="w-full bg-teal-700 text-white py-4 rounded-xl font-medium">
          Next
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/user/instant-delivery")({
  component: InstantDeliveryScreen,
}); 