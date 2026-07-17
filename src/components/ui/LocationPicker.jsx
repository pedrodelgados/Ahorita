import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronDown, Loader2, MapPin, Search } from "lucide-react";
import { COLORS, textStyle, TYPE } from "../../styles/theme";

const CUENCA_CENTER = { lat: -2.9006, lng: -79.0045 };
// Caja alrededor de Cuenca para sesgar (no filtrar de forma estricta) los
// resultados de búsqueda hacia la ciudad — sigue siendo una app hiperlocal.
const CUENCA_VIEWBOX = "-79.15,-2.83,-78.85,-3.05";

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

// Cuando lat/lng cambian (clic en el mapa o resultado de búsqueda elegido),
// el mapa se desplaza suavemente hacia el punto en vez de saltar de golpe.
function RecenterOnChange({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    }
  }, [lat, lng, map]);
  return null;
}

// Ubicación: buscar por dirección/nombre o tocar el mapa son los dos
// controles primarios. Lat/lng existen y son editables, pero viven detrás de
// un disclosure "avanzado" — nunca se presentan como el campo principal.
export default function LocationPicker({ lat, lng, onChange }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const debounceRef = useRef(null);

  const center = lat != null && lng != null ? { lat, lng } : CUENCA_CENTER;

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      setSearching(false);
      setSearchError(false);
      return;
    }
    setSearching(true);
    setSearchError(false);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=ec&viewbox=${CUENCA_VIEWBOX}&q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
        setSearchError(true);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function selectResult(result) {
    onChange(Number(result.lat), Number(result.lon));
    setQuery(result.display_name);
    setResults([]);
  }

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.inkSoft }} />
        <input
          placeholder="Buscar dirección o nombre del lugar…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36, paddingRight: searching ? 36 : 14 }}
        />
        {searching && (
          <Loader2
            size={15}
            className="ahorita-spin"
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.inkSoft }}
          />
        )}
        {results.length > 0 && (
          <div style={resultsStyle}>
            {results.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => selectResult(r)}
                style={resultItemStyle}
              >
                <MapPin size={14} color={COLORS.inkSoft} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
        {searchError && (
          <p style={textStyle(TYPE.metadata, { color: COLORS.error, marginTop: 6 })}>
            No se pudo buscar. Intenta de nuevo o toca el mapa directamente.
          </p>
        )}
      </div>

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
          <RecenterOnChange lat={lat} lng={lng} />
          {lat != null && lng != null && <Marker position={[lat, lng]} icon={markerIcon()} />}
        </MapContainer>
      </div>
      <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, marginBottom: 10 })}>
        Busca una dirección o toca el mapa para colocar la ubicación exacta.
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
  width: "100%",
  flex: 1,
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: 14,
  background: "#FFFFFF",
  boxSizing: "border-box",
};

const resultsStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: "calc(100% + 6px)",
  background: "#FFFFFF",
  borderRadius: 14,
  boxShadow: "var(--shadow-sheet)",
  padding: 6,
  zIndex: 30,
  maxHeight: 220,
  overflowY: "auto",
};

const resultItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  width: "100%",
  padding: "9px 10px",
  background: "none",
  border: "none",
  borderRadius: 10,
  textAlign: "left",
  cursor: "pointer",
  fontSize: 13,
};
