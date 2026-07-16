import { useState } from "react";
import { Sparkles } from "lucide-react";
import BottomSheet from "../../components/layout/BottomSheet";
import GuideChat from "./GuideChat";
import { COLORS } from "../../styles/theme";

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
          border: "1px solid rgba(43, 38, 34, 0.1)",
          background: "#FFFFFF",
          color: "#6b6360",
          fontSize: 14,
          textAlign: "left",
        }}
      >
        <Sparkles size={16} color={COLORS.accent} />
        Pregúntale a la Guía IA sobre Cuenca…
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <h2 style={{ fontSize: 19, marginBottom: 14 }}>Guía IA</h2>
        <GuideChat
          placeholder="Pregúntale a la Guía IA…"
          suggestions={SUGGESTIONS}
        />
      </BottomSheet>
    </>
  );
}
