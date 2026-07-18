import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { listBusinessSpecialHours, addBusinessSpecialHours, deleteBusinessSpecialHours } from "../../lib/businessHours";
import { COLORS, SPACE, textStyle, TYPE } from "../../styles/theme";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Excepciones por fecha (Fase 3, Bloque C, Entrega 4): feriados, cierres
// temporales, horario extraordinario. Cada una es una fila independiente
// (igual que una foto de la galería) — alta/baja inmediatas, sin un botón
// de guardado global. Tienen prioridad absoluta sobre el horario regular
// del mismo día (ya resuelto por business_effective_intervals en Postgres,
// Bloque B) — este editor solo lo comunica, no lo recalcula.
export default function SpecialHoursEditor({ businessId }) {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({ special_date: todayIso(), mode: "closed", opens_at: "09:00", closes_at: "18:00", reason: "" });
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    listBusinessSpecialHours(businessId).then(setItems);
  }, [businessId]);

  if (!items) return null;

  async function handleAdd() {
    if (form.mode === "interval" && (!form.opens_at || !form.closes_at || form.opens_at === form.closes_at)) {
      setError("Necesitas una hora de apertura y de cierre distintas.");
      return;
    }
    if (items.some((i) => i.special_date === form.special_date)) {
      setError("Ya existe una excepción para esa fecha.");
      return;
    }
    setError(null);
    setAdding(true);
    try {
      const payload = {
        special_date: form.special_date,
        is_closed: form.mode === "closed",
        is_24h: form.mode === "24h",
        opens_at: form.mode === "interval" ? form.opens_at : null,
        closes_at: form.mode === "interval" ? form.closes_at : null,
        reason: form.reason.trim() || null,
      };
      const created = await addBusinessSpecialHours(businessId, payload);
      setItems((prev) => [...prev, created].sort((a, b) => a.special_date.localeCompare(b.special_date)));
      setForm({ special_date: todayIso(), mode: "closed", opens_at: "09:00", closes_at: "18:00", reason: "" });
    } catch {
      setError("No se pudo guardar la excepción. Intenta de nuevo.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteBusinessSpecialHours(id);
    } catch {
      setError("No se pudo eliminar la excepción.");
    }
  }

  return (
    <div>
      <h3 style={textStyle(TYPE.h3, { margin: `0 0 ${SPACE.sm}px` })}>Horarios especiales</h3>
      <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: `0 0 ${SPACE.sm}px` })}>
        Anulan el horario regular únicamente ese día — feriados, cierres o aperturas extraordinarias.
      </p>

      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: SPACE.md }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: COLORS.borderSubtle, borderRadius: "var(--radius-sm)" }}>
              <div>
                <p style={textStyle(TYPE.bodySmall, { fontWeight: 700, margin: 0 })}>
                  {new Date(item.special_date + "T00:00:00").toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "2px 0 0" })}>
                  {item.is_closed ? "Cerrado" : item.is_24h ? "24 horas" : `${item.opens_at?.slice(0, 5)}–${item.closes_at?.slice(0, 5)}`}
                  {item.reason ? ` · ${item.reason}` : ""}
                </p>
              </div>
              <button onClick={() => handleDelete(item.id)} aria-label="Eliminar excepción" style={{ background: "none", border: "none", color: COLORS.error, display: "flex" }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input type="date" value={form.special_date} onChange={(e) => setForm((f) => ({ ...f, special_date: e.target.value }))} style={inputStyle} />
        <div style={{ display: "flex", gap: 4 }}>
          {["closed", "24h", "interval"].map((mode) => (
            <button
              key={mode}
              onClick={() => setForm((f) => ({ ...f, mode }))}
              style={{
                flex: 1, padding: "8px 0", borderRadius: "var(--radius-full)", border: "none",
                background: form.mode === mode ? COLORS.ink : COLORS.borderSubtle,
                color: form.mode === mode ? "#FFFFFF" : COLORS.inkSoft,
                ...textStyle(TYPE.metadata, { fontWeight: 700 }),
              }}
            >
              {mode === "closed" ? "Cerrado" : mode === "24h" ? "24 horas" : "Horario"}
            </button>
          ))}
        </div>
        {form.mode === "interval" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="time" value={form.opens_at} onChange={(e) => setForm((f) => ({ ...f, opens_at: e.target.value }))} style={inputStyle} />
            <span style={{ color: COLORS.inkSoft }}>–</span>
            <input type="time" value={form.closes_at} onChange={(e) => setForm((f) => ({ ...f, closes_at: e.target.value }))} style={inputStyle} />
          </div>
        )}
        <input
          placeholder="Motivo (opcional, ej. Feriado nacional)"
          value={form.reason}
          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          style={inputStyle}
        />
        <button
          onClick={handleAdd}
          disabled={adding}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "10px 16px", borderRadius: "var(--radius-full)", border: `1.5px solid ${COLORS.borderSubtle}`,
            background: "none", ...textStyle(TYPE.bodySmall, { fontWeight: 700 }),
          }}
        >
          <Plus size={15} />
          Agregar excepción
        </button>
      </div>

      {error && <p style={textStyle(TYPE.metadata, { color: COLORS.error, marginTop: 8 })}>{error}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: 14,
  background: "#FFFFFF",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
