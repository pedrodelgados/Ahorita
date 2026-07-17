import { useState } from "react";
import { Sparkles } from "lucide-react";
import BottomSheet from "../../components/layout/BottomSheet";
import GuideChat from "./GuideChat";
import { COLORS, textStyle, tint, TYPE } from "../../styles/theme";

const SUGGESTIONS = [
  "¿Qué hacer hoy en Cuenca?",
  "Dame una ruta por el Centro Histórico",
  "¿Dónde como algo típico?",
];

export default function GuideBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "10px 16px",
          borderRadius: "var(--radius-full)",
          border: `1px solid ${tint(COLORS.aiAccent, 0.35)}`,
          background: tint(COLORS.aiAccent, 0.07),
          color: COLORS.inkSoft,
          textAlign: "left",
          ...textStyle(TYPE.body, { fontSize: 14 }),
        }}
      >
        <Sparkles size={16} color={COLORS.aiAccent} />
        Pregúntale a la Guía IA sobre Cuenca…
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <h2 style={textStyle(TYPE.h2, { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 })}>
          <Sparkles size={17} color={COLORS.aiAccent} />
          Guía IA
        </h2>
        <GuideChat
          placeholder="Pregúntale a la Guía IA…"
          suggestions={SUGGESTIONS}
        />
      </BottomSheet>
    </>
  );
}
