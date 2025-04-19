import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

interface Position {
  lat: number;
  lng: number;
}

interface DeliveryMapProps {
  center: Position;
  markers?: Position[];
  onMapClick?: (position: Position) => void;
}

function MapEvents({ onClick }: { onClick?: (position: Position) => void }) {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  center,
  markers = [],
  onMapClick,
}) => {
  useEffect(() => {
    // Fix Leaflet default marker icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((position, index) => (
        <Marker
          key={index}
          position={[position.lat, position.lng]}
        />
      ))}
      <MapEvents onClick={onMapClick} />
    </MapContainer>
  );
}; 