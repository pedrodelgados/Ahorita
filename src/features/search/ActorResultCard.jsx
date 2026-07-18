import { CHANNELS, photoOverlay } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

// Tarjeta de resultado de negocio (Fase 3, Bloque C, Entrega 7) — mismo
// lenguaje visual que PlaceCard (grilla 1:1, imagen o respaldo por
// categoría, nombre superpuesto), para que Lugares y Negocios se sientan
// parte del mismo sistema aunque sus secciones nunca se mezclen.
export default function ActorResultCard({ actor, onClick }) {
  const channel = CHANNELS.find((c) => c.id === actor.category);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        background: "#EEE",
        boxShadow: "var(--shadow-card)",
        cursor: "pointer",
      }}
    >
      <ImageWithFallback
        src={actor.image_url}
        alt={actor.display_name}
        loading="lazy"
        iconSize={22}
        category={actor.category}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <div style={{ position: "absolute", inset: 0, background: photoOverlay({ strong: 0.6, soft: 0, mid: 0 }) }} />
      <div style={{ position: "absolute", left: 12, right: 12, bottom: 10, textAlign: "left" }}>
        <p style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 14, margin: 0 }}>{actor.display_name}</p>
        {channel && (
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, margin: 0 }}>{channel.label}</p>
        )}
      </div>
    </div>
  );
}
