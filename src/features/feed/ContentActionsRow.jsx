import { Heart, Send, Bookmark } from "lucide-react";
import { COLORS, textStyle, TYPE } from "../../styles/theme";

// Fase 4, Bloque 4 (hallazgo corregido, ver PROJECT.md): fila estática de
// acciones compartida entre Publicación y Promoción — reemplaza el riel
// flotante de SocialActions (pensado para tarjetas altas con imagen), que
// quedaba recortado por el overflow:hidden de la tarjeta cuando el
// contenido sin imagen era más corto que su desplazamiento vertical fijo.
// Al vivir siempre en el flujo normal del documento, debajo del contenido,
// nunca puede quedar fuera del área visible/clickeable — con imagen, sin
// imagen, con texto corto o largo, el resultado es el mismo. Eventos no
// tiene este problema (su tarjeta siempre usa una altura fija en svh, no
// determinada por el contenido) y sigue usando SocialActions sin cambios.
export default function ContentActionsRow({
  liked,
  likeCount,
  busyLike,
  onToggleLike,
  saved,
  busySave,
  onToggleSave,
  onShare,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "8px 16px",
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.borderSubtle}`,
      }}
    >
      <RowButton
        icon={<Heart size={20} fill={liked ? COLORS.accent : "none"} color={liked ? COLORS.accent : COLORS.ink} />}
        label={likeCount > 0 ? String(likeCount) : "Me gusta"}
        ariaLabel="Me gusta"
        onClick={onToggleLike}
        busy={busyLike}
        pressed={liked}
      />
      <RowButton
        icon={<Send size={19} color={COLORS.ink} />}
        label="Compartir"
        ariaLabel="Compartir"
        onClick={onShare}
      />
      <div style={{ flex: 1 }} />
      <RowButton
        icon={<Bookmark size={20} fill={saved ? COLORS.ink : "none"} color={COLORS.ink} />}
        label="Guardar"
        ariaLabel="Guardar"
        onClick={onToggleSave}
        busy={busySave}
        pressed={saved}
      />
    </div>
  );
}

function RowButton({ icon, label, ariaLabel, onClick, busy, pressed }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        minHeight: 44,
        padding: "6px 4px",
        background: "none",
        border: "none",
        opacity: busy ? 0.6 : 1,
      }}
    >
      {icon}
      <span style={textStyle(TYPE.metadata, { color: COLORS.ink, fontWeight: 600 })}>{label}</span>
    </button>
  );
}
