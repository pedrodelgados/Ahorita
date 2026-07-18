import { COLORS, textStyle, TYPE } from "../../styles/theme";
import BusinessOpenStatus from "./BusinessOpenStatus";

// Franja de actividad real (Fase 3, Bloque C): guardados y seguidores
// vienen de `interactions` (Fase 1, Bloque 4) — nunca una calificación de
// estrellas inventada, Ahorita no tiene ese dato.
//
// Entrega 6: los contadores ya no se consultan aquí — llegan como
// `counts` de `useActorSocialState`, la misma fuente que actualiza
// `ActionBar` al togglear, así que un "Seguir" se refleja al instante sin
// recargar. Los perfiles de persona muestran solo seguidores (guardar y el
// estado abierto/cerrado son conceptos exclusivos de negocio).
export default function ActivityStrip({ businessId, counts, isPersona }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, rowGap: 4, marginBottom: 4 }}>
      {counts && (
        <>
          {!isPersona && (
            <>
              <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft })}>
                <b style={{ color: COLORS.ink, fontWeight: 700 }}>{counts.guardados}</b> guardados
              </span>
              <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "0 6px" })}>·</span>
            </>
          )}
          <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft })}>
            <b style={{ color: COLORS.ink, fontWeight: 700 }}>{counts.seguidores}</b> seguidores
          </span>
          {!isPersona && <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "0 6px" })}>·</span>}
        </>
      )}
      {!isPersona && <BusinessOpenStatus businessId={businessId} />}
    </div>
  );
}
