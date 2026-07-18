import { ShieldCheck } from "lucide-react";
import { COLORS, textStyle, TYPE, tint } from "../../styles/theme";

// Decisión de producto (Entrega 1 del Bloque C, ver PROJECT.md): "vigente" y
// "en_gracia" muestran la misma insignia pública — para el público, un
// negocio en gracia sigue siendo confiable; el matiz de urgencia de
// renovación es información para el propietario (fases futuras), no para el
// visitante. "vencida" y "no_verificado" no muestran ninguna insignia — la
// verificación es una señal de desempate, nunca una acusación pública de
// "no confiable" (ver AI_PHILOSOPHY.md).
export default function VerificationBadge({ status }) {
  if (status !== "vigente" && status !== "en_gracia") return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px 3px 8px",
        borderRadius: "var(--radius-full)",
        background: tint(COLORS.success, 0.14),
        ...textStyle(TYPE.metadata, { color: COLORS.success, fontWeight: 700 }),
      }}
    >
      <ShieldCheck size={13} />
      Verificado
    </span>
  );
}
