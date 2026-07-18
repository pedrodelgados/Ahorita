import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  listBusinessHoursRaw,
  replaceBusinessHours,
  findOverlappingIntervals,
  DAY_LABELS_FULL,
  DAYS_DISPLAY_ORDER,
} from "../../lib/businessHours";
import { COLORS, SPACE, textStyle, TYPE } from "../../styles/theme";
import SaveStatusPill from "../../components/ui/SaveStatusPill";
import Button from "../../components/ui/Button";

function emptyDays() {
  const days = {};
  for (let d = 0; d < 7; d++) days[d] = { mode: "closed", intervals: [] };
  return days;
}

function rowsToDays(rows) {
  const days = emptyDays();
  for (const row of rows) {
    const day = days[row.day_of_week];
    if (row.is_closed) {
      day.mode = "closed";
    } else if (row.is_24h) {
      day.mode = "24h";
    } else {
      day.mode = "intervals";
      day.intervals.push({ opens_at: row.opens_at?.slice(0, 5), closes_at: row.closes_at?.slice(0, 5) });
    }
  }
  return days;
}

function snapshotOf(days) {
  return JSON.stringify(days);
}

// Editor de horarios regulares (Fase 3, Bloque C, Entrega 4): días
// abiertos/cerrados, múltiples intervalos, 24 horas, turnos que terminan
// después de medianoche. Se guarda como un reemplazo completo de la
// semana (borrar + insertar) — más simple y seguro que calcular una
// diferencia fila por fila, ya que el editor siempre trabaja con la
// semana entera a la vez. Distinto del guardado de logo/portada/bio: este
// tiene su propio botón porque es una edición staged independiente, pero
// su estado "sin guardar" se reporta hacia arriba (onDirtyChange) para que
// la protección de salida del editor completo también lo cubra.
export default function HoursEditor({ businessId, onDirtyChange }) {
  const [days, setDays] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState(null);
  const savedStatusTimeout = useRef(null);

  useEffect(() => {
    let cancelled = false;
    listBusinessHoursRaw(businessId).then((rows) => {
      if (cancelled) return;
      const loaded = rowsToDays(rows);
      setDays(loaded);
      setSavedSnapshot(snapshotOf(loaded));
    });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  useEffect(() => () => clearTimeout(savedStatusTimeout.current), []);

  const dirty = savedSnapshot !== null && days && snapshotOf(days) !== savedSnapshot;

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  if (!days) return null;

  function setDayMode(dow, mode) {
    setDays((prev) => ({ ...prev, [dow]: { mode, intervals: mode === "intervals" ? prev[dow].intervals.length ? prev[dow].intervals : [{ opens_at: "09:00", closes_at: "18:00" }] : [] } }));
    setSaveStatus(null);
    setError(null);
  }

  function addInterval(dow) {
    setDays((prev) => ({
      ...prev,
      [dow]: { ...prev[dow], intervals: [...prev[dow].intervals, { opens_at: "09:00", closes_at: "18:00" }] },
    }));
    setSaveStatus(null);
  }

  function removeInterval(dow, index) {
    setDays((prev) => ({
      ...prev,
      [dow]: { ...prev[dow], intervals: prev[dow].intervals.filter((_, i) => i !== index) },
    }));
    setSaveStatus(null);
  }

  function updateInterval(dow, index, field, value) {
    setDays((prev) => {
      const intervals = prev[dow].intervals.map((interval, i) => (i === index ? { ...interval, [field]: value } : interval));
      return { ...prev, [dow]: { ...prev[dow], intervals } };
    });
    setSaveStatus(null);
    setError(null);
  }

  async function handleSave() {
    for (const dow of DAYS_DISPLAY_ORDER) {
      const day = days[dow];
      if (day.mode !== "intervals") continue;
      for (const interval of day.intervals) {
        if (!interval.opens_at || !interval.closes_at || interval.opens_at === interval.closes_at) {
          setError(`${DAY_LABELS_FULL[dow]}: cada intervalo necesita una hora de apertura y de cierre distintas.`);
          return;
        }
      }
      const overlap = findOverlappingIntervals(day.intervals);
      if (overlap) {
        setError(`${DAY_LABELS_FULL[dow]}: hay dos intervalos que se superponen.`);
        return;
      }
    }

    setError(null);
    setSaveStatus("saving");
    try {
      await replaceBusinessHours(businessId, days);
      setSavedSnapshot(snapshotOf(days));
      setSaveStatus("saved");
      clearTimeout(savedStatusTimeout.current);
      savedStatusTimeout.current = setTimeout(() => setSaveStatus(null), 2500);
    } catch {
      setSaveStatus("error");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACE.sm }}>
        <h3 style={textStyle(TYPE.h3, { margin: 0 })}>Horario regular</h3>
        <SaveStatusPill status={saveStatus} dirty={dirty} />
      </div>

      {DAYS_DISPLAY_ORDER.map((dow) => (
        <div key={dow} style={{ borderBottom: `1px solid ${COLORS.borderSubtle}`, padding: `${SPACE.sm}px 0` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={textStyle(TYPE.bodySmall, { fontWeight: 700 })}>{DAY_LABELS_FULL[dow]}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {["closed", "24h", "intervals"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDayMode(dow, mode)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    background: days[dow].mode === mode ? COLORS.ink : COLORS.borderSubtle,
                    color: days[dow].mode === mode ? "#FFFFFF" : COLORS.inkSoft,
                    ...textStyle(TYPE.metadata, { fontWeight: 700 }),
                  }}
                >
                  {mode === "closed" ? "Cerrado" : mode === "24h" ? "24 horas" : "Horario"}
                </button>
              ))}
            </div>
          </div>

          {days[dow].mode === "intervals" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {days[dow].intervals.map((interval, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="time"
                    value={interval.opens_at}
                    onChange={(e) => updateInterval(dow, index, "opens_at", e.target.value)}
                    style={timeInputStyle}
                  />
                  <span style={{ color: COLORS.inkSoft }}>–</span>
                  <input
                    type="time"
                    value={interval.closes_at}
                    onChange={(e) => updateInterval(dow, index, "closes_at", e.target.value)}
                    style={timeInputStyle}
                  />
                  <button onClick={() => removeInterval(dow, index)} aria-label="Eliminar intervalo" style={iconButtonStyle}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => addInterval(dow)} style={{ ...iconButtonStyle, width: "auto", padding: "6px 10px", display: "inline-flex", gap: 4 }}>
                <Plus size={13} />
                <span style={textStyle(TYPE.metadata, { fontWeight: 600 })}>Agregar intervalo</span>
              </button>
            </div>
          )}
        </div>
      ))}

      {error && <p style={textStyle(TYPE.metadata, { color: COLORS.error, marginTop: SPACE.sm })}>{error}</p>}

      <Button
        disabled={saveStatus === "saving" || !dirty}
        onClick={handleSave}
        style={{ marginTop: SPACE.md, padding: "10px 20px", width: "100%" }}
      >
        {saveStatus === "saving" ? "Guardando…" : "Guardar horario"}
      </Button>
    </div>
  );
}

const timeInputStyle = {
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-sm)",
  padding: "8px 10px",
  fontSize: 14,
  background: "#FFFFFF",
  fontFamily: "inherit",
};

const iconButtonStyle = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "none",
  background: "none",
  color: COLORS.inkSoft,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
