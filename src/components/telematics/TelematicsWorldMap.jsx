import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLOR = {
  healthy: '#008009',
  degraded: '#bf4800',
  offline: '#cc0000',
};

function gatewayIcon(status, selected) {
  const fill = STATUS_COLOR[status] || STATUS_COLOR.healthy;
  const ring = selected ? '#0071e3' : '#ffffff';
  const svg = `
    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="11" fill="${fill}" stroke="${ring}" stroke-width="${selected ? 3 : 2}"/>
      <path d="M8.5 15.8h11c.4 0 .7-.3.7-.7v-.8l-1.1-3.1c-.1-.4-.5-.7-.9-.7h-1l-.8-1.2c-.2-.2-.4-.3-.7-.3h-3.6c-.3 0-.5.1-.7.3l-.8 1.2H9.7c-.4 0-.8.3-.9.7l-1.1 3.1v.8c0 .4.3.7.7.7z" fill="#fff"/>
      <circle cx="10.5" cy="16.2" r="1.15" fill="#fff"/>
      <circle cx="17.5" cy="16.2" r="1.15" fill="#fff"/>
    </svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export function TelematicsWorldMap({ gateways, selectedId, onSelect }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={12}
      className="h-full w-full rounded-2xl z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={[20, 0]} zoom={2} />
      {gateways.map(gw => (
        <Marker
          key={gw.id}
          position={[gw.latitude, gw.longitude]}
          icon={gatewayIcon(gw.status, gw.id === selectedId)}
          eventHandlers={{ click: () => onSelect(gw) }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold text-[14px] text-[#1d1d1f]">{gw.name}</p>
              <p className="text-[12px] text-[#86868b] mt-0.5">{gw.city}, {gw.country}</p>
              <p className="text-[12px] mt-2 capitalize">
                <span style={{ color: STATUS_COLOR[gw.status] }}>{gw.status}</span>
                {' · '}{gw.networkType}
              </p>
              <p className="text-[12px] text-[#86868b] mt-1">
                {gw.connectedVehicles.toLocaleString()} vehicles · {gw.avgLatencyMs}ms
              </p>
              <button
                type="button"
                onClick={() => onSelect(gw)}
                className="mt-2 text-[12px] text-[#0071e3] hover:underline"
              >
                View gateway
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default TelematicsWorldMap;
