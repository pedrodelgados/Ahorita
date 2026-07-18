import { useState } from "react";
import { Sparkles } from "lucide-react";
import { COLORS, SPACE, textStyle, TYPE, tint } from "../../styles/theme";
import GuideChat from "../ai/GuideChat";

// Tarjeta de la Guía IA (Fase 3, Bloque C, Entrega 2): abre el mismo chat
// genérico ya usado en PlaceSheet. Todavía SIN contexto del negocio — eso
// es Fase 7 (sesiones persistentes y personalización); por ahora es una
// invitación honesta a un asistente general, no una promesa de que ya
// "conoce" a este negocio en particular.
export default function GuideTeaser({ actorName }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div
        style={{
          background: COLORS.surface, borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)",
          padding: SPACE.md, marginBottom: SPACE.lg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
          <h3 style={textStyle(TYPE.h3, { margin: 0 })}>Guía IA</h3>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: COLORS.inkSoft, fontSize: 13 }}>
            Cerrar
          </button>
        </div>
        <GuideChat placeholder={`Pregunta sobre ${actorName}…`} suggestions={["¿Hay algo parecido cerca?", "¿Qué debería pedir aquí?"]} />
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "12px 14px", borderRadius: "var(--radius-sm)",
        border: `1px solid ${tint(COLORS.aiAccent, 0.3)}`, background: tint(COLORS.aiAccent, 0.08),
        marginBottom: SPACE.lg,
      }}
    >
      <Sparkles size={17} color={COLORS.aiAccent} />
      <span style={textStyle(TYPE.bodySmall, { color: COLORS.ink, fontWeight: 600 })}>
        Pregúntale a la Guía IA sobre {actorName}
      </span>
    </button>
  );
}
