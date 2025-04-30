import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DeliveryMapProps {
  center: { lat: number; lng: number };
  markers?: { lat: number; lng: number }[];
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

// Fix Leaflet's default icon issue
const defaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

function LocationMarker({ onLocationSelect }: { onLocationSelect?: (location: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return null;
}

export function DeliveryMap({ center, markers = [], onLocationSelect }: DeliveryMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      style={{ width: '100%', height: '400px' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((pos, idx) => (
        <Marker key={idx} position={[pos.lat, pos.lng]} icon={defaultIcon} />
      ))}
      {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} />}
    </MapContainer>
  );
} 