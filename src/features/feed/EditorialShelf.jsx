import { COLORS, photoOverlay, textStyle, TYPE } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

// Bloque editorial horizontal — el sistema visual del feed ya está
// preparado para este tipo de contenido ("Selección del editor",
// "Imperdibles de hoy", rutas temáticas como "Ruta del café"...), aunque
// todavía no se cura ni se genera ningún bloque real: getFeed() no produce
// items de este tipo hoy. Ver PROJECT.md, "Sistema editorial (preparado,
// no implementado)".
export default function EditorialShelf({ title, subtitle, items = [] }) {
  if (items.length === 0) return null;

  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{ padding: "4px 4px 10px" }}>
        {subtitle && (
          <p style={textStyle(TYPE.kicker, { color: COLORS.inkSoft, margin: "0 0 2px" })}>{subtitle}</p>
        )}
        <h3 style={textStyle(TYPE.cardTitleCompact, { margin: 0 })}>{title}</h3>
      </div>

      <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 4px 4px" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              position: "relative",
              flexShrink: 0,
              width: 160,
              height: 200,
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              background: "#1c1a18",
            }}
          >
            <ImageWithFallback
              src={item.image}
              alt={item.title}
              iconSize={20}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: photoOverlay({ strong: 0.7, soft: 0.05, mid: 0.1 }),
              }}
            />
            <p
              style={textStyle(TYPE.bodySmall, {
                position: "absolute",
                left: 10,
                right: 10,
                bottom: 10,
                color: "#FFFFFF",
                margin: 0,
                fontWeight: 600,
              })}
            >
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
