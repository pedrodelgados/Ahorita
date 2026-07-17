import { ArrowLeft } from "lucide-react";
import { COLORS, SPACE, textStyle, TYPE } from "../../styles/theme";

// Encabezado reutilizable: logo/título a la izquierda (o botón volver),
// acciones a la derecha, y una fila opcional debajo (búsqueda, filtros).
export default function AppHeader({ title, display = false, onBack, right, children, sticky = true }) {
  return (
    <div
      style={
        sticky
          ? {
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "var(--color-bg)",
              borderBottom: "1px solid var(--color-border-subtle)",
            }
          : { borderBottom: "1px solid var(--color-border-subtle)" }
      }
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACE.sm,
          justifyContent: "space-between",
          padding: onBack ? `${SPACE.md}px ${SPACE.xl}px` : `${SPACE.md}px ${SPACE.lg}px 2px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{ background: "none", border: "none", display: "flex", color: COLORS.ink }}
              aria-label="Volver"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 style={textStyle(display ? TYPE.display : TYPE.h1, { margin: 0 })}>{title}</h1>
        </div>
        {right && <div style={{ display: "flex", alignItems: "center", gap: SPACE.md }}>{right}</div>}
      </header>
      {children}
    </div>
  );
}
