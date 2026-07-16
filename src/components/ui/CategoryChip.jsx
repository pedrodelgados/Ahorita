import { tint } from "../../styles/theme";

// Círculo/pill de categoría: tinte suave (8-15% opacidad) inactivo, color sólido activo.
export default function CategoryChip({ label, color, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: "var(--radius-full)",
        border: "none",
        fontSize: 14,
        fontWeight: 600,
        background: active ? color : tint(color, 0.12),
        color: active ? "#FFFFFF" : "#2B2622",
        transition: "background 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}
