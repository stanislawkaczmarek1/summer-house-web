import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../../components/common/Navbar';
import { cottagesApi } from '../../api/cottages';
import './MapPage.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createPriceIcon(price, active = false) {
  const label = `$${Math.round(price)}`;
  return L.divIcon({
    className: '',
    html: `<div class="map-marker ${active ? 'map-marker--active' : ''}">${label}</div>`,
    iconSize: [64, 32],
    iconAnchor: [32, 32],
    popupAnchor: [0, -36],
  });
}

function FitBounds({ cottages }) {
  const map = useMap();
  useEffect(() => {
    const valid = cottages.filter(c => c.latitude && c.longitude);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView([parseFloat(valid[0].latitude), parseFloat(valid[0].longitude)], 13);
      return;
    }
    const bounds = L.latLngBounds(
      valid.map(c => [parseFloat(c.latitude), parseFloat(c.longitude)])
    );
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [cottages, map]);
  return null;
}

const DEFAULT_CENTER = [52.0, 19.0];
const DEFAULT_ZOOM = 6;

export default function MapPage() {
  const [cottages, setCottages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    cottagesApi.getAll()
      .then(r => setCottages(r.data.filter(c => c.visible && c.latitude && c.longitude)))
      .catch(() => setError('Failed to load cottages.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="map-page">
      <Navbar />

      {loading && (
        <div className="map-page__loading">
          <span className="spinner spinner--lg" />
          <p>Loading map…</p>
        </div>
      )}

      {error && !loading && (
        <div className="map-page__error">
          <span>⚠</span>
          <p>{error}</p>
          <button className="btn btn--outline btn--sm" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}



      <Link to="/cottages" className="map-page__list-btn animate-fade-in-down">
        ⊞ List View
      </Link>

      {!loading && (
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="map-page__map"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds cottages={cottages} />

          {cottages.map(cottage => (
            <Marker
              key={cottage.id}
              position={[parseFloat(cottage.latitude), parseFloat(cottage.longitude)]}
              icon={createPriceIcon(cottage.pricePerNight, activeId === cottage.id)}
              eventHandlers={{
                click: () => setActiveId(cottage.id),
                popupclose: () => setActiveId(null),
              }}
            >
              <Popup className="cottage-popup" minWidth={220}>
                <div className="cottage-popup__inner">
                  {cottage.images?.[0]?.imageUrl ? (
                    <div className="cottage-popup__img">
                      <img src={cottage.images[0].imageUrl} alt={cottage.name} />
                    </div>
                  ) : (
                    <div className="cottage-popup__img cottage-popup__img--empty">⌂</div>
                  )}

                  <div className="cottage-popup__body">
                    <h3 className="cottage-popup__name">{cottage.name}</h3>

                    {cottage.address && (
                      <p className="cottage-popup__address">⊹ {cottage.address}</p>
                    )}

                    <div className="cottage-popup__meta">
                      <span className="cottage-popup__capacity">Up to ◎ {cottage.capacity} guests</span>
                      <span className="cottage-popup__price">
                        ${Math.round(cottage.pricePerNight)}<span>/night</span>
                      </span>
                    </div>

                    <Link
                      to={`/cottages/${cottage.id}`}
                      className="cottage-popup__btn"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
