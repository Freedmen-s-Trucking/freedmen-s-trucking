import { createFileRoute } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";
import { useState, useEffect } from "react";
import { MobileButton } from "../../../components/mobile/mobileButton";

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
  const pickupLocation: LatLngTuple = [24.8607, 67.0011];
  const dropoffLocation: LatLngTuple = [24.8707, 67.0111];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return <div className="font-mobile text-mobile-text">Loading map...</div>;
  }

  const center: LatLngTuple = [
    (pickupLocation[0] + dropoffLocation[0]) / 2,
    (pickupLocation[1] + dropoffLocation[1]) / 2
  ];

  return (
    <div className="h-screen w-full relative font-mobile">
      {/* Status Bar */}
      {/* <div className="absolute top-0 left-0 right-0 bg-[#F2F2F2] z-[1000] px-4 py-2">
        <div className="text-center text-sm font-semibold">9:41</div>
      </div> */}

      {/* Title */}
      <div className="absolute top-12 left-0 right-0 z-[1000] px-4">
        {/* <h1 className="text-2xl font-medium text-mobile-text">Start Delivery</h1> */}
      </div>

      <div className="absolute inset-0">
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
      </div>

      {/* Bottom Card */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-[1000]">
        <div className="p-6 space-y-6">
          {/* User Info Section */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#E5F3F3] rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-mobile-text">DE</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-mobile-text">Davidson Edgar</h3>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4].map((star) => (
                  <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm text-gray-600 ml-1">4.1</span>
              </div>
              <div className="text-sm text-gray-500">20 Deliveries</div>
              <div className="text-sm text-gray-500">Electronics/Gadgets</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-gray-500">Recipient: Paul Pogba</span>
                <span className="text-sm text-blue-500">+41686869641</span>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 flex items-center justify-center mt-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Pick Up</div>
                <div className="font-medium text-mobile-text">32 Samwell Sq, Chevron</div>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 flex items-center justify-center mt-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Drop Off</div>
                <div className="font-medium text-mobile-text">21b, Karimu Kotun Street, Victoria Island</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <MobileButton 
            isPrimary={true}
            text="Start Delivery"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/start-delivery")({
  component: StartDeliveryScreen,
}); 