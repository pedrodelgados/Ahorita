import { useEffect, useState } from "react";
import { listBusinessCatalog, formatItemPrice } from "../../lib/catalog";
import { COLORS, SPACE, textStyle, TYPE, tint } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

// Catálogo por colecciones (Fase 3, Bloque C, Entrega 2): una estantería
// horizontal por colección con al menos un ítem visible. Sin colecciones
// con contenido, esta sección no se monta — nunca un contenedor vacío con
// el título "Catálogo" y nada debajo.
export default function CatalogSection({ businessId }) {
  const [shelves, setShelves] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listBusinessCatalog(businessId)
      .then((s) => {
        if (!cancelled) setShelves(s);
      })
      .catch(() => {
        if (!cancelled) setShelves([]);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  if (!shelves || shelves.length === 0) return null;

  return (
    <div>
      {shelves.map(({ collection, items }) => (
        <div key={collection.id ?? "unassigned"} style={{ marginBottom: SPACE.lg }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: SPACE.sm }}>
            <h3 style={textStyle(TYPE.h3, { margin: 0 })}>{collection.name}</h3>
            <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft })}>{items.length} ítems</span>
          </div>
          <div style={{ display: "flex", gap: SPACE.sm, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 2 }}>
            {items.map((item) => (
              <div key={item.id} style={{ flexShrink: 0, width: 128, scrollSnapAlign: "start" }}>
                <div
                  style={{
                    width: 128,
                    height: 96,
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    marginBottom: 6,
                    background: tint(COLORS.accent, 0.1),
                  }}
                >
                  {item.image_url && (
                    <ImageWithFallback src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                <p style={textStyle(TYPE.bodySmall, { fontWeight: 600, margin: "0 0 2px", lineHeight: 1.25 })}>{item.name}</p>
                <p style={textStyle(TYPE.metadata, { color: COLORS.accent, fontWeight: 700, margin: 0 })}>
                  {formatItemPrice(item)}
                  {item.availability === "agotado" && (
                    <span style={{ color: COLORS.inkSoft, fontWeight: 500 }}> · Agotado</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
