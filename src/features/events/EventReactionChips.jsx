import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { COLORS, textStyle, TYPE } from "../../styles/theme";

// Fase 5B, Bloque 2: "Quiero ir" y "Ya fui" — exclusivos de EventSheet, a
// propósito (ver PROJECT.md): FeedCard ya tiene cuatro controles flotantes
// sobre la foto y agregar dos más habría repetido el hallazgo de recorte ya
// resuelto en la Fase 4 para Publicación/Promoción. Aquí, dentro del sheet,
// hay espacio real y ninguna restricción de altura.
//
// Dos chips independientes, nunca un control segmentado tipo radio — un
// segmentado sugeriría visualmente una exclusión mutua que no existe: se
// puede haber querido ir y haber ido, son dos momentos distintos.
export default function EventReactionChips({
  quieroIr,
  quieroIrCount,
  quieroIrBusy,
  quieroIrDisabled,
  quieroIrUnavailableReason,
  onToggleQuieroIr,
  yaFui,
  yaFuiCount,
  yaFuiBusy,
  yaFuiDisabled,
  yaFuiUnavailableReason,
  onToggleYaFui,
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "4px 0" }}>
      <div>
        <Chip
          icon={<CalendarPlus size={16} fill={quieroIr ? COLORS.accent : "none"} color={quieroIr ? COLORS.accent : COLORS.ink} />}
          label="Quiero ir"
          count={quieroIrCount}
          pressed={quieroIr}
          busy={quieroIrBusy}
          disabled={quieroIrDisabled}
          onClick={onToggleQuieroIr}
        />
        {quieroIrDisabled && !quieroIrBusy && quieroIrUnavailableReason && (
          <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "4px 0 0 2px" })}>
            {quieroIrUnavailableReason}
          </p>
        )}
      </div>
      <div>
        <Chip
          icon={<CheckCircle2 size={16} fill={yaFui ? COLORS.success : "none"} color={yaFui ? COLORS.success : COLORS.ink} />}
          label="Ya fui"
          count={yaFuiCount}
          pressed={yaFui}
          busy={yaFuiBusy}
          disabled={yaFuiDisabled}
          onClick={onToggleYaFui}
        />
        {yaFuiDisabled && !yaFuiBusy && yaFuiUnavailableReason && (
          <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "4px 0 0 2px" })}>
            {yaFuiUnavailableReason}
          </p>
        )}
      </div>
    </div>
  );
}

function Chip({ icon, label, count, pressed, busy, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={busy || disabled}
      aria-label={label}
      aria-pressed={pressed}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        minHeight: 40,
        padding: "8px 14px",
        borderRadius: "var(--radius-full)",
        border: `1px solid ${pressed ? "transparent" : "rgba(43, 38, 34, 0.14)"}`,
        background: pressed ? "rgba(232, 120, 92, 0.1)" : "transparent",
        opacity: busy ? 0.6 : disabled ? 0.45 : 1,
      }}
    >
      {icon}
      <span style={textStyle(TYPE.metadata, { color: COLORS.ink, fontWeight: 600 })}>
        {label}
        {count > 0 ? ` · ${count}` : ""}
      </span>
    </button>
  );
}
