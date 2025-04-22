import { createFileRoute } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";
import { useState, useEffect } from "react";
import { IoCall } from "react-icons/io5";

// Fix for default marker icons in Leaflet
const pickupIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function StartDeliveryScreen() {
  // Example coordinates - replace these with actual pickup and dropoff locations
  const pickupLocation: LatLngTuple = [24.8607, 67.0011]; // Example coordinates
  const dropoffLocation: LatLngTuple = [24.8707, 67.0111]; // Example coordinates
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return <div>Loading map...</div>;
  }

  // Calculate center point between pickup and dropoff
  const center: LatLngTuple = [
    (pickupLocation[0] + dropoffLocation[0]) / 2,
    (pickupLocation[1] + dropoffLocation[1]) / 2
  ];

  return (
    <div className="h-screen w-full relative">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        className="z-0"
      >
        <ZoomControl position="topleft" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={pickupLocation} icon={pickupIcon} />
        <Marker position={dropoffLocation} icon={dropoffIcon} />
      </MapContainer>

      {/* Bottom Dialog */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-[1000]">
        <div className="p-6">
          {/* User Info Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm">DE</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Davidson Edgar</span>
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600">4.1</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">Electronics/Gadgets</div>
            </div>
            <button className="text-teal-600 flex items-center gap-2">
              <IoCall className="w-5 h-5" />
              <span>Call Recipient</span>
            </button>
          </div>

          {/* Location Section */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Pickup Location</div>
                <div className="font-medium">32 Samwell Sq, Chevron</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Delivery Location</div>
                <div className="font-medium">21b, Karimu Kotun Street, Victoria Island</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full px-4 py-3 text-white bg-teal-600 rounded-xl">
            Start Drop off process
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/start-delivery")({
  component: StartDeliveryScreen,
}); 