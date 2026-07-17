import { COLORS, photoOverlay, SPACE, textStyle, TYPE } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import LocationMetadata from "../../components/ui/LocationMetadata";

// Bloque editorial horizontal: rompe el ritmo vertical del feed a
// propósito — no es una lista más, es una selección con aire, curada,
// pensada para deslizarse. El sistema es genérico (recibe title/subtitle/
// items), así que sirve tanto para "Selección del editor" como para
// futuros bloques (Imperdibles de hoy, Ruta del café...) sin cambiar el
// componente. Ver PROJECT.md, "Sistema editorial".
export default function EditorialShelf({ title, subtitle, items = [], onOpenItem }) {
  if (items.length === 0) return null;

  return (
    <section style={{ marginBottom: SPACE.xxl }}>
      <div style={{ padding: `2px ${SPACE.xxs}px ${SPACE.md}px` }}>
        {subtitle && (
          <p style={textStyle(TYPE.kicker, { color: COLORS.inkSoft, margin: "0 0 3px" })}>{subtitle}</p>
        )}
        <h3 style={textStyle(TYPE.cardTitle, { margin: 0 })}>{title}</h3>
      </div>

      <div
        style={{
          display: "flex",
          gap: SPACE.sm + 2,
          overflowX: "auto",
          padding: `0 ${SPACE.xxs}px ${SPACE.xxs}px`,
          // Insinúa que hay más contenido a la derecha sin un ícono/flecha
          // genérica — el borde simplemente se desvanece.
          WebkitMaskImage: "linear-gradient(to right, black calc(100% - 28px), transparent)",
          maskImage: "linear-gradient(to right, black calc(100% - 28px), transparent)",
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onOpenItem?.(item.eventId ?? item.id)}
            style={{
              position: "relative",
              flexShrink: 0,
              width: 172,
              height: 228,
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              background: "#1c1a18",
              border: "none",
              padding: 0,
              textAlign: "left",
            }}
          >
            <ImageWithFallback
              src={item.image}
              alt={item.title}
              iconSize={22}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: photoOverlay({ strong: 0.75, soft: 0.05, mid: 0.12 }),
              }}
            />
            <div style={{ position: "absolute", left: 12, right: 12, bottom: 12 }}>
              {item.location && (
                <LocationMetadata location={item.location} style={{ marginBottom: 3, fontSize: 11 }} />
              )}
              <p style={textStyle(TYPE.cardTitleCompact, { color: "#FFFFFF", margin: 0, lineHeight: 1.2 })}>
                {item.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
