import { COLORS, textStyle, TYPE } from "../../styles/theme";
import Button from "./Button";

// Confirmación para acciones destructivas/irreversibles (eliminar). Ocultar
// es reversible y no la usa — un toggle de un clic es suficiente para eso.
export default function ConfirmationModal({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      <div
        onClick={onCancel}
        style={{ position: "absolute", inset: 0, background: "rgba(43, 38, 34, 0.5)" }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(360px, calc(100vw - 48px))",
          background: COLORS.surface,
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-sheet)",
          padding: 24,
        }}
      >
        <h2 style={textStyle(TYPE.h3, { marginBottom: 8 })}>{title}</h2>
        <p style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft, marginBottom: 20 })}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" fullWidth onClick={onCancel} style={{ padding: "12px 16px" }}>
            {cancelLabel}
          </Button>
          <Button
            fullWidth
            onClick={onConfirm}
            style={{
              padding: "12px 16px",
              background: danger ? COLORS.error : COLORS.accent,
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
