import { useState } from "react";
import { Map, Grid3x3 } from "lucide-react";
import { COLORS } from "../styles/theme";
import PlaceGrid from "../features/places/PlaceGrid";
import PlaceSheet from "../features/places/PlaceSheet";
import MapView from "../features/explore/MapView";
import GuideCapsule from "../features/ai/GuideCapsule";

export default function ExplorePage() {
  const [view, setView] = useState("map");
  const [selectedPlace, setSelectedPlace] = useState(null);

  return (
    <div style={{ minHeight: "100svh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(43, 38, 34, 0.08)",
        }}
      >
        <h1 style={{ fontSize: 22 }}>Explorar</h1>
        <ViewToggle view={view} onChange={setView} />
      </header>

      <div style={{ padding: "10px 16px 0" }}>
        <GuideCapsule context="explorar" />
      </div>

      {view === "map" ? (
        <MapView onSelectPlace={setSelectedPlace} />
      ) : (
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px calc(84px + env(safe-area-inset-bottom))" }}>
          <PlaceGrid onSelectPlace={setSelectedPlace} />
        </main>
      )}

      <PlaceSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </div>
  );
}

function ViewToggle({ view, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        background: "rgba(43, 38, 34, 0.06)",
        borderRadius: "var(--radius-full)",
        padding: 3,
      }}
    >
      <ToggleButton active={view === "map"} onClick={() => onChange("map")} icon={<Map size={15} />} label="Mapa" />
      <ToggleButton
        active={view === "grid"}
        onClick={() => onChange("grid")}
        icon={<Grid3x3 size={15} />}
        label="Cuadrícula"
      />
    </div>
  );
}

function ToggleButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        border: "none",
        borderRadius: "var(--radius-full)",
        padding: "7px 14px",
        fontSize: 13,
        fontWeight: 600,
        background: active ? "#FFFFFF" : "transparent",
        color: active ? COLORS.ink : COLORS.inkSoft,
        boxShadow: active ? "var(--shadow-card)" : "none",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
