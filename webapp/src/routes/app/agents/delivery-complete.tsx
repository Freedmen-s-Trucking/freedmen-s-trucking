import { createFileRoute } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";
import { useNavigate } from "@tanstack/react-router";
import { IoCheckmarkCircle } from "react-icons/io5";

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

function DeliveryCompleteScreen() {
  const navigate = useNavigate();
  const pickupLocation: LatLngTuple = [24.8607, 67.0011];
  const dropoffLocation: LatLngTuple = [24.8707, 67.0111];
  
  const center: LatLngTuple = [
    (pickupLocation[0] + dropoffLocation[0]) / 2,
    (pickupLocation[1] + dropoffLocation[1]) / 2
  ];

  const handleDone = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <h1 className="text-xl font-medium text-gray-800">Complete</h1>
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

      {/* Success Dialog */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-[1000] p-6 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2">
            <IoCheckmarkCircle className="w-12 h-12 text-green-500" />
          </div>
          <div className="text-3xl font-semibold mb-2">$300</div>
          <p className="text-gray-600">
            Great you have completed this delivery, your wallet has been credited with the delivery cost.
          </p>
        </div>

        <button 
          onClick={handleDone}
          className="w-full px-4 py-3 text-white bg-teal-600 rounded-xl font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/delivery-complete")({
  component: DeliveryCompleteScreen,
}); 