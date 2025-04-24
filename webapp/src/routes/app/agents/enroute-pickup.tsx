import { createFileRoute } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";
import { useNavigate } from "@tanstack/react-router";
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

function EnroutePickupScreen() {
  const navigate = useNavigate();
  const pickupLocation: LatLngTuple = [24.8607, 67.0011];
  const dropoffLocation: LatLngTuple = [24.8707, 67.0111];
  
  const center: LatLngTuple = [
    (pickupLocation[0] + dropoffLocation[0]) / 2,
    (pickupLocation[1] + dropoffLocation[1]) / 2
  ];

  const handleArrive = () => {
    // Navigate to the next screen when arrived
    navigate({ to: "/app/agents/start-delivery" });
  };

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        {/* <h1 className="text-xl font-mobile text-mobile-text">Enroute Pickup</h1> */}
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

      {/* Status Dialog */}
      <div className="absolute bottom-0 left-0 right-0 bg-mobile-background rounded-t-3xl shadow-lg z-[1000]">
        <div className="p-6 space-y-4">
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2"></div>
          <p className="text-center text-mobile-text font-mobile">
            You are Enroute Pick Up Location
          </p>
          <MobileButton 
            isPrimary={true}
            text="Arrive"
            onClick={handleArrive}
          />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/enroute-pickup")({
  component: EnroutePickupScreen,
}); 