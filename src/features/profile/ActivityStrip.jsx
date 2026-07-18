import { useEffect, useState } from "react";
import { getActorInteractionCounts } from "../../lib/interactions";
import { COLORS, textStyle, TYPE } from "../../styles/theme";
import BusinessOpenStatus from "./BusinessOpenStatus";

// Franja de actividad real (Fase 3, Bloque C, Entrega 2): guardados y
// seguidores vienen de `interactions` (Fase 1, Bloque 4) — nunca una
// calificación de estrellas inventada, Ahorita no tiene ese dato.
export default function ActivityStrip({ actorId, businessId }) {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getActorInteractionCounts(actorId)
      .then((c) => {
        if (!cancelled) setCounts(c);
      })
      .catch(() => {
        if (!cancelled) setCounts(null);
      });
    return () => {
      cancelled = true;
    };
  }, [actorId]);

  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, rowGap: 4, marginBottom: 4 }}>
      {counts && (
        <>
          <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft })}>
            <b style={{ color: COLORS.ink, fontWeight: 700 }}>{counts.guardados}</b> guardados
          </span>
          <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "0 6px" })}>·</span>
          <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft })}>
            <b style={{ color: COLORS.ink, fontWeight: 700 }}>{counts.seguidores}</b> seguidores
          </span>
          <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "0 6px" })}>·</span>
        </>
      )}
      <BusinessOpenStatus businessId={businessId} />
    </div>
  );
}
