import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack } from "react-icons/io5";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { useState, useEffect } from "react";

// Fix for default marker icon in Leaflet
const defaultIcon = new Icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function RequestMapScreen() {
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        // Default to a fallback location if geolocation fails
        setPosition([40.7128, -74.0060]); // New York City coordinates as fallback
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="h-screen relative">
        <div className="absolute top-0 left-0 right-0 z-10 bg-white p-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <IoChevronBack className="w-6 h-6" />
          </button>
        </div>

        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} icon={defaultIcon} />
        </MapContainer>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/request-map")({
  component: RequestMapScreen,
}); 