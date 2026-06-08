import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CottageMap.css';

// Fix default marker icon broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green marker
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
  className: 'leaflet-marker--custom',
});

// Helper to fly to coordinates when they change
function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

export default function CottageMap({ lat, lng, name, address }) {
  if (!lat || !lng) {
    return (
      <div className="cottage-map cottage-map--empty">
        <span className="cottage-map__empty-icon">◎</span>
        <p>Location not available</p>
      </div>
    );
  }

  const position = [parseFloat(lat), parseFloat(lng)];

  return (
    <div className="cottage-map">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={false}
        className="cottage-map__map"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo lat={position[0]} lng={position[1]} />
        <Marker position={position} icon={customIcon}>
          <Popup className="cottage-map__popup">
            <strong>{name}</strong>
            {address && <span>{address}</span>}
          </Popup>
        </Marker>
      </MapContainer>

      <a
        className="cottage-map__directions"
        href={`https://www.openstreetmap.org/directions?from=&to=${position[0]}%2C${position[1]}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        ⊹ Get Directions
      </a>
    </div>
  );
}
