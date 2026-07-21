// Fase 5B, Bloque 1: legacy de solo respaldo. El frontend ya no importa este
// módulo — la fuente de verdad de "guardado" en Eventos es `interactions`
// (ver lib/interactions.js, listMySavedEventIds/toggleSavedEvent). No se
// elimina todavía: su retiro físico requiere su propia migración futura,
// tras un período de convivencia observado en producción.
import { supabase } from "./supabaseClient";

export async function listSavedEvents(userId) {
  const { data, error } = await supabase
    .from("saved_events")
    .select("event_id, events(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => row.events);
}

export async function listSavedEventIds(userId) {
  const { data, error } = await supabase
    .from("saved_events")
    .select("event_id")
    .eq("user_id", userId);
  if (error) throw error;
  return data.map((row) => row.event_id);
}

export async function saveEvent(userId, eventId) {
  const { error } = await supabase
    .from("saved_events")
    .insert({ user_id: userId, event_id: eventId });
  if (error) throw error;
}

export async function unsaveEvent(userId, eventId) {
  const { error } = await supabase
    .from("saved_events")
    .delete()
    .eq("user_id", userId)
    .eq("event_id", eventId);
  if (error) throw error;
}
