import { supabase } from "./supabaseClient";

// Fase 6, Bloque 3 (ver FASE6_CONTRATO_ARQUITECTONICO.md, componente 5):
// capa de datos del Motor Editorial. Reemplaza a events.editor_pick (legacy
// desde la migración 0040) como fuente de verdad de qué contenido está
// seleccionado editorialmente -- events.editor_pick ya no recibe escrituras
// nuevas desde la aplicación.

// Fuente que consumirá pickEditorSelection() (lib/feed.js) -- mismo
// contrato de "sin límite de cantidad" de candidatos_editorial(): decidir
// cuántos y en qué orden sigue siendo responsabilidad del propio feed, no
// de este Motor.
export async function listEditorialSelectedEventIds() {
  const { data, error } = await supabase.rpc("candidatos_editorial");
  if (error) throw error;
  return data.filter((row) => row.target_type === "event").map((row) => row.target_id);
}

// Estado editorial público de un contenido puntual (Centro de administración
// de eventos) -- nunca expone quién decidió, solo lo que ya es público por
// diseño (ver editorial_selection_public() en la migración 0040).
export async function getEventEditorialSelection(eventId) {
  const { data, error } = await supabase.rpc("editorial_selection_public", {
    p_target_type: "event",
    p_target_id: eventId,
  });
  if (error) throw error;
  const row = data?.[0];
  return { selected: row?.active ?? false, reasonCode: row?.reason_code ?? null };
}

// Retirar algo que ya no está seleccionado es un no-op, no un error -- el
// admin puede desmarcar la casilla sin que eso dependa de un estado interno
// que no controla directamente.
export async function setEventEditorialSelection(eventId, selected, reasonCode = "seleccionado_equipo") {
  if (selected) {
    const { error } = await supabase.rpc("set_editorial_selection", {
      p_target_type: "event",
      p_target_id: eventId,
      p_reason_code: reasonCode,
    });
    if (error) throw error;
    return;
  }
  const { error } = await supabase.rpc("revoke_editorial_selection", {
    p_target_type: "event",
    p_target_id: eventId,
  });
  if (error && !/no existe una selecci.n editorial activa/i.test(error.message || "")) {
    throw error;
  }
}

export function describeEditorialError(error) {
  if (error?.code === "42501" || /row-level security/i.test(error?.message || "")) {
    return "No tienes permiso para hacer esto.";
  }
  return "No se pudo actualizar la selección editorial. Intenta de nuevo.";
}
