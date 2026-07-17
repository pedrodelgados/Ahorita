import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import BottomSheet from "../../components/layout/BottomSheet";
import GuideChat from "./GuideChat";
import { withViewTransition } from "../../lib/viewTransition";
import { COLORS, textStyle, tint, TYPE } from "../../styles/theme";

// Mensajes contextuales por sección — nunca el mismo texto siempre. La Guía
// IA debe sentirse como una invitación editorial que cambia, no como una
// barra de búsqueda estática. Ver PROJECT.md, "ADN de marca".
const MESSAGES = {
  inicio: [
    "Hoy Cuenca tiene algo para ti.",
    "¿Quieres un plan para esta tarde?",
    "Encontré algo que podría gustarte.",
    "Pregúntame qué hacer hoy.",
  ],
  explorar: [
    "Descubre lugares cerca de ti.",
    "¿A dónde te gustaría ir hoy?",
    "Puedo armarte una ruta por el centro.",
  ],
};

const SUGGESTIONS = [
  "¿Qué hacer hoy en Cuenca?",
  "Dame una ruta por el Centro Histórico",
  "¿Dónde como algo típico?",
];

const TRANSITION_NAME = "ahorita-guide-capsule";

// La cápsula de la Guía IA: una pieza editorial, no un botón de chat. Sin
// relleno sólido, sin sombra dura, sin ícono de burbuja — un texto en
// itálica que respira muy suave y una sola marca visual (lavanda). Al
// tocarla se "expande" hacia la conversación completa vía la misma View
// Transitions API usada en feed→detalle: el mismo gesto en toda la app es,
// en sí mismo, una firma de marca.
export default function GuideCapsule({ context = "inicio" }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(true);
  const messages = MESSAGES[context] ?? MESSAGES.inicio;

  useEffect(() => {
    if (messages.length < 2) return undefined;
    const cycle = setInterval(() => {
      setShown(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setShown(true);
      }, 450);
    }, 7000);
    return () => clearInterval(cycle);
  }, [messages]);

  function openGuide() {
    withViewTransition(() => setOpen(true));
  }

  function closeGuide() {
    withViewTransition(() => setOpen(false));
  }

  return (
    <>
      <button
        onClick={openGuide}
        aria-label="Abrir la Guía IA"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          maxWidth: "100%",
          padding: "9px 16px",
          borderRadius: "var(--radius-full)",
          border: `1px solid ${tint(COLORS.aiAccent, 0.3)}`,
          background: tint(COLORS.aiAccent, 0.06),
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          viewTransitionName: open ? "none" : TRANSITION_NAME,
        }}
      >
        <Sparkles size={14} className="ahorita-breathe" color={COLORS.aiAccent} style={{ flexShrink: 0 }} />
        <span
          style={{
            ...textStyle(TYPE.kicker, { color: COLORS.ink }),
            opacity: shown ? 0.92 : 0,
            transition: "opacity 0.45s ease",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {messages[index]}
        </span>
      </button>

      <BottomSheet
        open={open}
        onClose={closeGuide}
        panelStyle={{ viewTransitionName: open ? TRANSITION_NAME : "none" }}
      >
        <h2 style={textStyle(TYPE.h2, { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 })}>
          <Sparkles size={17} color={COLORS.aiAccent} className="ahorita-breathe" />
          Guía IA
        </h2>
        <GuideChat placeholder="Pregúntale a la Guía IA…" suggestions={SUGGESTIONS} />
      </BottomSheet>
    </>
  );
}
