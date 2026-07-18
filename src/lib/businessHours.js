import { supabase } from "./supabaseClient";

const DAY_LABELS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const DAY_LABELS_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
// Orden de visualización de la semana: lunes primero, aunque
// day_of_week (igual que extract(dow) de Postgres) empieza en domingo (0).
export const DAYS_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DISPLAY_ORDER = DAYS_DISPLAY_ORDER;

function formatTime(t) {
  // "08:00:00" -> "08:00"
  return t?.slice(0, 5) ?? "";
}

function formatDay(rows) {
  const closed = rows.find((r) => r.is_closed);
  if (closed) return "Cerrado";
  const is24h = rows.find((r) => r.is_24h);
  if (is24h) return "24 horas";
  const intervals = rows.filter((r) => !r.is_closed && !r.is_24h);
  if (intervals.length === 0) return null;
  return intervals.map((r) => `${formatTime(r.opens_at)}–${formatTime(r.closes_at)}`).join(" y ");
}

// Horario semanal, agrupando días consecutivos con el mismo texto (p. ej.
// "Lun–Sáb: 08:00–22:00") en vez de repetir la misma línea siete veces.
export async function getBusinessWeekHoursText(businessId) {
  const { data, error } = await supabase
    .from("business_hours")
    .select("day_of_week, is_closed, is_24h, opens_at, closes_at")
    .eq("business_id", businessId)
    .order("display_order", { ascending: true });
  if (error) throw error;

  const rowsByDay = new Map();
  for (const row of data) {
    if (!rowsByDay.has(row.day_of_week)) rowsByDay.set(row.day_of_week, []);
    rowsByDay.get(row.day_of_week).push(row);
  }

  const days = DISPLAY_ORDER.map((dow) => ({
    dow,
    text: rowsByDay.has(dow) ? formatDay(rowsByDay.get(dow)) : null,
  })).filter((d) => d.text !== null);

  if (days.length === 0) return null;

  const groups = [];
  for (const day of days) {
    const last = groups[groups.length - 1];
    if (last && last.text === day.text) {
      last.endDow = day.dow;
    } else {
      groups.push({ startDow: day.dow, endDow: day.dow, text: day.text });
    }
  }

  return groups
    .map((g) =>
      g.startDow === g.endDow
        ? `${DAY_LABELS_SHORT[g.startDow]} ${g.text}`
        : `${DAY_LABELS_SHORT[g.startDow]}–${DAY_LABELS_SHORT[g.endDow]} ${g.text}`
    )
    .join(" · ");
}

// ---------------------------------------------------------------------------
// Edición (Fase 3, Bloque C, Entrega 4). Los horarios regulares se guardan
// como reemplazo completo (borrar + insertar) — más simple y seguro que
// calcular una diferencia fila por fila, dado que el editor siempre trabaja
// con la semana completa a la vez. Los horarios especiales, en cambio, son
// altas/bajas puntuales (una excepción a la vez), igual que la galería.
// ---------------------------------------------------------------------------

export async function listBusinessHoursRaw(businessId) {
  const { data, error } = await supabase
    .from("business_hours")
    .select("*")
    .eq("business_id", businessId)
    .order("day_of_week", { ascending: true })
    .order("opens_at", { ascending: true });
  if (error) throw error;
  return data;
}

// Convierte "HH:MM" en minutos desde medianoche.
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Mismo criterio que time_interval_to_ranges() en Postgres: un intervalo que
// cruza medianoche se parte en dos rangos [apertura,1440) y [0,cierre).
function toRanges(opensAt, closesAt) {
  const o = toMinutes(opensAt);
  const c = toMinutes(closesAt);
  if (c < o) return [[o, 1440], [0, c]];
  return [[o, c]];
}

function rangesOverlap(a, b) {
  return a[0] < b[1] && b[0] < a[1];
}

// Revisa un único día: intervals es la lista de {opens_at, closes_at} de ESE
// día (nunca cerrado/24h). Devuelve el par de índices que se superponen, o
// null si no hay ninguno — validación previa en el cliente, la misma regla
// que ya aplica el trigger de Postgres como frontera real.
export function findOverlappingIntervals(intervals) {
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const rangesA = toRanges(intervals[i].opens_at, intervals[i].closes_at);
      const rangesB = toRanges(intervals[j].opens_at, intervals[j].closes_at);
      for (const ra of rangesA) {
        for (const rb of rangesB) {
          if (rangesOverlap(ra, rb)) return [i, j];
        }
      }
    }
  }
  return null;
}

// Reemplaza todo el horario regular del negocio. `days` es un objeto
// {[dayOfWeek]: { mode: "closed"|"24h"|"intervals", intervals: [...] }}.
export async function replaceBusinessHours(businessId, days) {
  const rows = [];
  for (const [dow, day] of Object.entries(days)) {
    if (day.mode === "closed") {
      rows.push({ business_id: businessId, day_of_week: Number(dow), is_closed: true });
    } else if (day.mode === "24h") {
      rows.push({ business_id: businessId, day_of_week: Number(dow), is_24h: true });
    } else {
      day.intervals.forEach((interval, index) => {
        rows.push({
          business_id: businessId,
          day_of_week: Number(dow),
          opens_at: interval.opens_at,
          closes_at: interval.closes_at,
          display_order: index,
        });
      });
    }
  }

  const { error: deleteError } = await supabase.from("business_hours").delete().eq("business_id", businessId);
  if (deleteError) throw deleteError;

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("business_hours").insert(rows);
    if (insertError) throw insertError;
  }
}

export async function listBusinessSpecialHours(businessId) {
  const { data, error } = await supabase
    .from("business_special_hours")
    .select("*")
    .eq("business_id", businessId)
    .order("special_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addBusinessSpecialHours(businessId, payload) {
  const { data, error } = await supabase
    .from("business_special_hours")
    .insert({ business_id: businessId, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBusinessSpecialHours(id) {
  const { error } = await supabase.from("business_special_hours").delete().eq("id", id);
  if (error) throw error;
}
