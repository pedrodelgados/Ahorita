import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronDown } from "lucide-react";
import { COLORS, textStyle, TYPE } from "../../styles/theme";

const CUENCA_CENTER = { lat: -2.9006, lng: -79.0045 };

function markerIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:${COLORS.accent};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);transform:rotate(-45deg)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Ubicación: el mapa (clic para colocar el pin) es el control primario. Lat/
// lng existen y son editables, pero viven detrás de un disclosure "avanzado"
// — nunca se presentan como el campo principal.
export default function LocationPicker({ lat, lng, onChange }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const center = lat != null && lng != null ? { lat, lng } : CUENCA_CENTER;

  return (
    <div>
      <div
        style={{
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={14}
          style={{ height: 240, width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <ClickHandler onPick={onChange} />
          {lat != null && lng != null && <Marker position={[lat, lng]} icon={markerIcon()} />}
        </MapContainer>
      </div>
      <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, marginBottom: 10 })}>
        Toca el mapa para colocar la ubicación exacta.
      </p>

      <button
        type="button"
        onClick={() => setAdvancedOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: COLORS.inkSoft,
          ...textStyle(TYPE.metadata, { fontWeight: 600 }),
        }}
      >
        <ChevronDown
          size={14}
          style={{ transform: advancedOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        />
        Coordenadas avanzadas
      </button>

      {advancedOpen && (
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input
            type="number"
            step="any"
            placeholder="Latitud"
            value={lat ?? ""}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null, lng)}
            style={inputStyle}
          />
          <input
            type="number"
            step="any"
            placeholder="Longitud"
            value={lng ?? ""}
            onChange={(e) => onChange(lat, e.target.value ? Number(e.target.value) : null)}
            style={inputStyle}
          />
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  flex: 1,
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: 14,
  background: "#FFFFFF",
  boxSizing: "border-box",
};
