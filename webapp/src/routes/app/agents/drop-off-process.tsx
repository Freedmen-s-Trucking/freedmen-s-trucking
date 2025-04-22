import { createFileRoute } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";
import { useState, useEffect } from "react";
// import { IoCall } from "react-icons/io5";
import { useNavigate } from "@tanstack/react-router";

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

function DropOffProcessScreen() {
  const navigate = useNavigate();
  // Example coordinates - replace these with actual pickup and dropoff locations
  const pickupLocation: LatLngTuple = [24.8607, 67.0011];
  const dropoffLocation: LatLngTuple = [24.8707, 67.0111];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return <div>Loading map...</div>;
  }

  const center: LatLngTuple = [
    (pickupLocation[0] + dropoffLocation[0]) / 2,
    (pickupLocation[1] + dropoffLocation[1]) / 2
  ];

  const handleStartDropOff = () => {
    navigate({ to: "/app/agents/drop-off-photo" });
  };

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <h1 className="text-xl font-medium text-gray-800">Start Drop Off Process</h1>
      </div>

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
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-[1000] p-6 space-y-4">
        <div className="text-base font-medium text-gray-900">
          5 minutes to delivery
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-medium text-teal-800">DE</span>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Davidson Edgar</div>
            <div className="flex items-center gap-1">
              <div className="text-sm text-gray-600">20 Deliveries</div>
              <span className="text-gray-400">•</span>
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
          </div>
        </div>

        <button className="text-teal-600 font-medium w-full text-center">
          Call Recipient
        </button>

        <button 
          onClick={handleStartDropOff}
          className="w-full px-4 py-3 text-white bg-teal-600 rounded-xl font-medium"
        >
          Start Drop off process
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/drop-off-process")({
  component: DropOffProcessScreen,
}); 