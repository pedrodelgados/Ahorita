import { X } from "lucide-react";

// Hoja deslizable desde abajo (estilo Apple Maps): el contenido detrás
// (mapa/cuadrícula) permanece visible y montado.
export default function BottomSheet({ open, onClose, children, panelStyle }) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(43, 38, 34, 0.4)" }}
      />
      <div
        className="ahorita-sheet"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "85vh",
          overflowY: "auto",
          background: "var(--color-bg)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: "var(--shadow-sheet)",
          padding: "12px 20px calc(24px + env(safe-area-inset-bottom))",
          ...panelStyle,
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "rgba(43, 38, 34, 0.2)",
            margin: "0 auto 16px",
          }}
        />
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(43, 38, 34, 0.06)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
