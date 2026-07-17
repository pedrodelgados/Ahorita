import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { COLORS, textStyle, TYPE } from "../../styles/theme";

// Menú de acciones por elemento en los listados de /admin (editar, duplicar,
// ocultar/publicar, eliminar) — un único punto de entrada en vez de varios
// botones sueltos compitiendo por espacio en la fila.
export default function ActionsMenu({ actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Más acciones"
        style={triggerStyle}
      >
        <MoreVertical size={17} />
      </button>
      {open && (
        <div style={menuStyle} role="menu">
          {actions.map((action) => (
            <button
              key={action.label}
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                action.onClick();
              }}
              style={{ ...itemStyle, color: action.danger ? COLORS.error : COLORS.ink }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const triggerStyle = {
  background: "rgba(43, 38, 34, 0.06)",
  border: "none",
  borderRadius: "50%",
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: COLORS.ink,
};

const menuStyle = {
  position: "absolute",
  right: 0,
  top: "calc(100% + 6px)",
  background: "#FFFFFF",
  borderRadius: 14,
  boxShadow: "var(--shadow-sheet)",
  padding: 6,
  minWidth: 176,
  zIndex: 30,
  display: "flex",
  flexDirection: "column",
};

const itemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  background: "none",
  border: "none",
  borderRadius: 10,
  textAlign: "left",
  cursor: "pointer",
  ...textStyle(TYPE.bodySmall, { fontWeight: 500 }),
};
