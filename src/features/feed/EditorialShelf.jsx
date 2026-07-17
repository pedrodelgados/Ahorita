import { bottomFade, COLORS, SPACE, textStyle, TYPE } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import LocationMetadata from "../../components/ui/LocationMetadata";

const CARD_WIDTH = 172;
const CARD_GAP = SPACE.sm + 2;

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
      <div style={{ padding: `2px 0 ${SPACE.md}px` }}>
        {subtitle && (
          <p style={textStyle(TYPE.kicker, { color: COLORS.inkSoft, margin: "0 0 3px" })}>{subtitle}</p>
        )}
        <h3 style={textStyle(TYPE.cardTitle, { margin: 0 })}>{title}</h3>
      </div>

      <div
        style={{
          display: "flex",
          gap: CARD_GAP,
          overflowX: "auto",
          padding: `0 0 ${SPACE.xs}px`,
          // Snap suave: cada tarjeta termina alineada al soltar el gesto,
          // sin sentirse forzado — "mandatory" pero con tarjetas del mismo
          // ancho, así el punto de reposo siempre cae natural.
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          // Insinúa que hay más contenido a la derecha sin un ícono/flecha
          // genérica — el borde simplemente se desvanece. La tarjeta
          // siguiente ya asoma parcialmente por el ancho fijo + el gap.
          WebkitMaskImage: "linear-gradient(to right, black calc(100% - 32px), transparent)",
          maskImage: "linear-gradient(to right, black calc(100% - 32px), transparent)",
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onOpenItem?.(item.eventId ?? item.id)}
            style={{
              position: "relative",
              flexShrink: 0,
              width: CARD_WIDTH,
              height: 228,
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              background: "#1c1a18",
              border: "none",
              padding: 0,
              textAlign: "left",
              scrollSnapAlign: "start",
            }}
          >
            <ImageWithFallback
              src={item.image}
              alt={item.title}
              iconSize={22}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Overlay solo en la franja inferior — la foto respira, el
                texto tiene contraste garantizado sin oscurecer la imagen. */}
            <div style={{ position: "absolute", inset: 0, background: bottomFade() }} />
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
