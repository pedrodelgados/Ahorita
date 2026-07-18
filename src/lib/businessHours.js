import { supabase } from "./supabaseClient";

const DAY_LABELS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
// Orden de visualización de la semana: lunes primero, aunque
// day_of_week (igual que extract(dow) de Postgres) empieza en domingo (0).
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

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
