import { useState } from "react";
import { Footprints, Bike, TramFront, Car, Bus, Navigation } from "lucide-react";
import { useGeolocation } from "../../hooks/useGeolocation";
import {
  haversineKm,
  estimateMinutes,
  googleMapsDirectionsUrl,
  uberDeepLink,
  CUENCA_TRANSIT_FARE,
} from "../../lib/directions";
import { COLORS } from "../../styles/theme";

export default function DirectionsSection({ place }) {
  const { position, error } = useGeolocation();
  const [expanded, setExpanded] = useState(false);

  if (!place.lat || !place.lng) return null;

  const km = position ? haversineKm(position.lat, position.lng, place.lat, place.lng) : null;

  const modes = [
    { id: "walk", label: "Caminando", Icon: Footprints, speed: 5 },
    { id: "bike", label: "Bici", Icon: Bike, speed: 15 },
    { id: "tram", label: "Tranvía", Icon: TramFront, speed: null },
    { id: "car", label: "Auto", Icon: Car, speed: 30 },
  ];

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: 16,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 15 }}>Cómo llegar</h3>
        {km !== null && (
          <span style={{ fontSize: 13, color: COLORS.inkSoft, fontWeight: 600 }}>
            {km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`}
          </span>
        )}
      </div>

      {!position && (
        <p style={{ fontSize: 12, color: COLORS.inkSoft, margin: "4px 0 10px" }}>
          {error
            ? "Activa la ubicación en tu navegador para ver distancia y tiempo estimados."
            : "Calculando tu ubicación…"}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "12px 0 14px" }}>
        {modes.map(({ id, label, Icon, speed }) => (
          <div
            key={id}
            style={{
              flexShrink: 0,
              minWidth: 88,
              textAlign: "center",
              background: "var(--color-bg)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 6px",
            }}
          >
            <Icon size={18} color={COLORS.accent} style={{ marginBottom: 4 }} />
            <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{label}</p>
            <p style={{ fontSize: 11, color: COLORS.inkSoft, margin: "2px 0 0" }}>
              {id === "tram" ? CUENCA_TRANSIT_FARE : km !== null ? `${estimateMinutes(km, speed)} min` : "—"}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <LinkButton href={googleMapsDirectionsUrl(place.lat, place.lng)} solid>
          <Navigation size={14} /> Cómo llegar
        </LinkButton>
        <LinkButton href={uberDeepLink(place.lat, place.lng, place.name)}>Pedir Uber</LinkButton>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          background: "none",
          border: "none",
          color: COLORS.accent,
          fontSize: 13,
          fontWeight: 600,
          marginTop: 12,
        }}
      >
        {expanded ? "Ocultar transporte disponible" : "Ver transporte disponible"}
      </button>

      {expanded && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <TransitCard
            icon={<TramFront size={16} color={COLORS.accent} />}
            title="Tranvía Cuatro Ríos"
            subtitle={`Parada más cercana: cerca de ${place.area ?? "esta zona"} · Tarifa ${CUENCA_TRANSIT_FARE}`}
          />
          <TransitCard
            icon={<Bus size={16} color={COLORS.accent} />}
            title="Bus urbano"
            subtitle={`Tarifa unificada ${CUENCA_TRANSIT_FARE} · consulta la app de tu operador para rutas y horarios exactos`}
          />
          <p style={{ fontSize: 11, color: COLORS.inkSoft, margin: 0, lineHeight: 1.4 }}>
            Taxi convencional: para uno en la calle o pide uno por WhatsApp/app local. Los tiempos y
            tarifas de Uber y taxi son estimados — varían según tráfico y demanda.
          </p>
        </div>
      )}
    </div>
  );
}

function TransitCard({ icon, title, subtitle }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: "var(--color-bg)",
        borderRadius: "var(--radius-sm)",
        padding: "10px 12px",
      }}
    >
      {icon}
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12, color: COLORS.inkSoft, margin: "2px 0 0" }}>{subtitle}</p>
      </div>
    </div>
  );
}

function LinkButton({ href, solid, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "9px 16px",
        borderRadius: "var(--radius-full)",
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        background: solid ? COLORS.accent : "rgba(43, 38, 34, 0.06)",
        color: solid ? "#FFFFFF" : COLORS.ink,
      }}
    >
      {children}
    </a>
  );
}
