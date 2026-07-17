import { COLORS, textStyle, TYPE } from "../../styles/theme";

// Una sección con título fijo dentro del flujo progresivo del editor admin
// (ver PROJECT.md "Administración completa de eventos y lugares"): una sola
// página deslizable, dividida visualmente en bloques claros — no un wizard
// de pasos bloqueantes.
export default function FormSection({ index, title, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: COLORS.ink,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            ...textStyle(TYPE.metadata, { fontWeight: 700 }),
          }}
        >
          {index}
        </span>
        <h2 style={textStyle(TYPE.h3, { margin: 0 })}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
