// Canal de soporte de la beta (ver BETA_READINESS_CHECKLIST.md, A19):
// una persona real respondiendo directamente, no un sistema de tickets
// (ETAPA_PRODUCTO_VIVO.md §5 lo exige explícitamente para esta etapa).
export const SUPPORT_EMAIL = "moises82004@gmail.com";

export default function SupportSection() {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, marginBottom: 6 }}>Ayuda y soporte</h2>
      <p style={{ color: "#948A80", fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
        ¿Algo no funciona, necesitas ayuda, o quieres ejercer un derecho relacionado con tus datos?
      </p>
      <a href={`mailto:${SUPPORT_EMAIL}`} style={{ fontSize: 13, fontWeight: 600, color: "#4FA383" }}>
        {SUPPORT_EMAIL}
      </a>
    </div>
  );
}
