// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// import L from "leaflet";
// import { useEffect } from "react";
// import "leaflet/dist/leaflet.css";

// interface Position {
//   lat: number;
//   lng: number;
// }

// interface DeliveryMapProps {
//   center: Position;
//   markers?: Position[];
//   onMapClick?: (position: Position) => void;
// }

// // Handle map clicks
// function MapEvents({ onClick }: { onClick?: (position: Position) => void }) {
//   useMapEvents({
//     click: (e) => {
//       onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
//     },
//   });
//   return null;
// }

// export const DeliveryMap: React.FC<DeliveryMapProps> = ({
//   center,
//   markers = [],
//   onMapClick,
// }) => {
//   useEffect(() => {
//     L.Icon.Default.mergeOptions({
//       iconRetinaUrl:
//         "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//       iconUrl:
//         "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//       shadowUrl:
//         "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//     });
//   }, []);

//   return (
//     <MapContainer
//       center={[center.lat, center.lng]}
//       zoom={13}
//       scrollWheelZoom={true}
//       style={{ width: "100%", height: "100%" }}
//       className="z-0 rounded-lg"
//     >
//       {/* ✅ This is essential — without it, the map context is broken */}
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       {markers.map((pos, idx) => (
//         <Marker key={idx} position={[pos.lat, pos.lng]} />
//       ))}

//       {onMapClick && <MapEvents onClick={onMapClick} />}
//     </MapContainer>
//   );
// };



export function DeliveryMap() {
  return (
    <div className="w-full h-full">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13604.42753828443!2d74.27661825!3d31.5212242!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1746096679043!5m2!1sen!2s"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Map"
      />
    </div>
  );
}