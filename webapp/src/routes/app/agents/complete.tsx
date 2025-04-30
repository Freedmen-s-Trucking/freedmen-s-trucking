import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { MobileButton } from "../../../components/mobile/mobileButton";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";
import { IoCheckmark } from "react-icons/io5";

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

function CompleteScreen() {
  const navigate = useNavigate();
  const pickupLocation: LatLngTuple = [24.8607, 67.0011];
  const dropoffLocation: LatLngTuple = [24.8707, 67.0111];
  
  const center: LatLngTuple = [
    (pickupLocation[0] + dropoffLocation[0]) / 2,
    (pickupLocation[1] + dropoffLocation[1]) / 2
  ];

  const handleDone = () => {
    navigate({ to: "/app/agents/home" });
  };

  return (
    <div className="h-screen w-full relative font-mobile">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 bg-[#F2F2F2] z-[1000] px-4 py-2">
        {/* <div className="text-center text-sm font-semibold">9:41</div> */}
      </div>

      {/* Title */}
      <div className="absolute top-12 left-0 right-0 z-[1000] px-4">
        {/* <h1 className="text-2xl font-medium text-mobile-text">Complete</h1> */}
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
      <div className="absolute bottom-0 left-0 right-0 bg-mobile-background rounded-t-3xl shadow-lg z-[1000]">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-mobile-background rounded-full flex items-center justify-center">
              <IoCheckmark className="w-8 h-8 text-mobile-text" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-semibold text-mobile-text mb-1">$300</div>
              <p className="text-gray-500">
                Great you have completed this delivery, your wallet has been credited with the delivery cost.
              </p>
            </div>
          </div>

          <MobileButton 
            isPrimary={true}
            text="Done"
            onClick={handleDone}
          />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/complete")({
  component: CompleteScreen,
}); 