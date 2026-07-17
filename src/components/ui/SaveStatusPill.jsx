import { AlertCircle, Check, Loader2 } from "lucide-react";
import { COLORS, textStyle, TYPE, tint } from "../../styles/theme";

// Estado de guardado del editor admin: cambios sin guardar / guardando /
// guardado / error. La prioridad de qué mostrar es intencional — "guardando"
// gana siempre; "error" gana sobre "sin guardar" porque justo después de un
// intento fallido el formulario sigue tan "sucio" como antes de intentar
// guardar (nada cambió), así que si no priorizáramos el error quedaría
// oculto detrás de un simple "cambios sin guardar". Editar de nuevo limpia
// el estado a null desde el editor, y ahí "sin guardar" vuelve a mandar.
export default function SaveStatusPill({ status, dirty }) {
  let content = null;
  if (status === "saving") {
    content = { icon: <Loader2 size={13} className="ahorita-spin" />, label: "Guardando…", color: COLORS.inkSoft };
  } else if (status === "error") {
    content = { icon: <AlertCircle size={13} />, label: "Error al guardar", color: COLORS.error };
  } else if (dirty) {
    content = { icon: <span style={dotStyle(COLORS.warning)} />, label: "Cambios sin guardar", color: COLORS.warning };
  } else if (status === "saved") {
    content = { icon: <Check size={13} />, label: "Guardado", color: COLORS.success };
  }

  if (!content) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: "var(--radius-full)",
        background: tint(content.color, 0.14),
        color: content.color,
        whiteSpace: "nowrap",
        ...textStyle(TYPE.metadata, { fontWeight: 600 }),
      }}
    >
      {content.icon}
      {content.label}
    </span>
  );
}

function dotStyle(color) {
  return { width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" };
}
