import { useState } from "react";
import { Footprints, Bike, TramFront, Car, Bus, Navigation, ArrowUpRight } from "lucide-react";
import { useGeolocation } from "../../hooks/useGeolocation";
import {
  haversineKm,
  estimateMinutes,
  googleMapsDirectionsUrl,
  uberDeepLink,
  CUENCA_TRANSIT_FARE,
} from "../../lib/directions";
import { COLORS, SPACE, textStyle, TYPE } from "../../styles/theme";
import Button from "../../components/ui/Button";

// Sección "Cómo llegar": ligera y editorial, no una ficha técnica. Una sola
// acción principal (el botón "Cómo llegar"); todo lo demás — modos de
// transporte, Uber, tranvía/bus — es texto con aire, sin cajas dentro de
// cajas.
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
    <div style={{ marginBottom: SPACE.xl }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: SPACE.xs }}>
        <h3 style={textStyle(TYPE.h3, { margin: 0 })}>Cómo llegar</h3>
        {km !== null && (
          <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, fontWeight: 600 })}>
            {km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`}
          </span>
        )}
      </div>

      {!position && (
        <p style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft, margin: `0 0 ${SPACE.sm}px` })}>
          {error
            ? "Activa la ubicación en tu navegador para ver distancia y tiempo estimados."
            : "Calculando tu ubicación…"}
        </p>
      )}

      {/* Fila de modos: solo texto + ícono, sin fondo individual por tarjeta. */}
      <div style={{ display: "flex", gap: SPACE.lg, overflowX: "auto", margin: `${SPACE.sm}px 0` }}>
        {modes.map(({ id, label, Icon, speed }) => (
          <div key={id} style={{ flexShrink: 0, textAlign: "center", minWidth: 60 }}>
            <Icon size={17} color={COLORS.accent} style={{ marginBottom: 4 }} />
            <p style={textStyle(TYPE.bodySmall, { fontWeight: 600, margin: 0 })}>{label}</p>
            <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "1px 0 0" })}>
              {id === "tram" ? CUENCA_TRANSIT_FARE : km !== null ? `${estimateMinutes(km, speed)} min` : "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Una sola acción principal; Uber queda como enlace ligero, no un
          segundo botón compitiendo con el mismo peso visual. */}
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.md, flexWrap: "wrap" }}>
        <Button
          as="a"
          href={googleMapsDirectionsUrl(place.lat, place.lng)}
          target="_blank"
          rel="noreferrer"
          icon={<Navigation size={14} />}
          style={{ padding: "10px 20px", fontSize: 14 }}
        >
          Cómo llegar
        </Button>
        <a
          href={uberDeepLink(place.lat, place.lng, place.name)}
          target="_blank"
          rel="noreferrer"
          style={textStyle(TYPE.bodySmall, { color: COLORS.ink, fontWeight: 600, textDecoration: "underline" })}
        >
          Pedir Uber
        </a>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          color: COLORS.inkSoft,
          marginTop: SPACE.md,
          padding: 0,
          ...textStyle(TYPE.bodySmall, { fontWeight: 600 }),
        }}
      >
        {expanded ? "Ocultar transporte disponible" : "Ver transporte disponible"}
        <ArrowUpRight size={13} style={{ transform: expanded ? "rotate(135deg)" : "none", transition: "transform 0.2s ease" }} />
      </button>

      {expanded && (
        <div style={{ marginTop: SPACE.sm, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
          <TransitRow
            icon={<TramFront size={15} color={COLORS.accent} />}
            title="Tranvía Cuatro Ríos"
            subtitle={`Parada más cercana: cerca de ${place.area ?? "esta zona"} · Tarifa ${CUENCA_TRANSIT_FARE}`}
          />
          <TransitRow
            icon={<Bus size={15} color={COLORS.accent} />}
            title="Bus urbano"
            subtitle={`Tarifa unificada ${CUENCA_TRANSIT_FARE} · consulta la app de tu operador para rutas y horarios exactos`}
          />
          <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: `${SPACE.xxs}px 0 0`, lineHeight: 1.4 })}>
            Taxi convencional: para uno en la calle o pide uno por WhatsApp/app local. Los tiempos y
            tarifas de Uber y taxi son estimados — varían según tráfico y demanda.
          </p>
        </div>
      )}
    </div>
  );
}

function TransitRow({ icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", gap: SPACE.sm, alignItems: "flex-start" }}>
      {icon}
      <div>
        <p style={textStyle(TYPE.bodySmall, { fontWeight: 600, margin: 0 })}>{title}</p>
        <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "2px 0 0" })}>{subtitle}</p>
      </div>
    </div>
  );
}
