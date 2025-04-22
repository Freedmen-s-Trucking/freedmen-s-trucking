import { createFileRoute } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";
import { useNavigate } from "@tanstack/react-router";
import { IoChevronBack } from "react-icons/io5";

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

function RequestDetailsScreen() {
  const navigate = useNavigate();
  const pickupLocation: LatLngTuple = [24.8607, 67.0011];
  const dropoffLocation: LatLngTuple = [24.8707, 67.0111];
  
  const center: LatLngTuple = [
    (pickupLocation[0] + dropoffLocation[0]) / 2,
    (pickupLocation[1] + dropoffLocation[1]) / 2
  ];

  const handleAccept = () => {
    navigate({ to: "/app/agents/enroute-pickup" });
  };

  const handleReject = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="h-screen w-full relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-gray-700"
          >
            <IoChevronBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-medium">Request Map Details</h1>
        </div>
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

      {/* Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-4 bg-white z-[1000]">
        <button 
          onClick={handleReject}
          className="flex-1 px-4 py-3 text-teal-600 bg-white border border-teal-600 rounded-xl font-medium"
        >
          Reject
        </button>
        <button 
          onClick={handleAccept}
          className="flex-1 px-4 py-3 text-white bg-teal-600 rounded-xl font-medium"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/request-details")({
  component: RequestDetailsScreen,
}); 