import { supabase } from "./supabaseClient";

// Galería principal editable (Fase 3, Bloque C, Entrega 3). Límite de
// cantidad como decisión de producto (una galería curada, no un álbum sin
// fin) — no hay ninguna restricción a nivel de base de datos.
export const MAX_GALLERY_ITEMS = 12;

export async function addActorMedia({ actorId, mediaUrl, displayOrder }) {
  const { data, error } = await supabase
    .from("actor_media")
    .insert({ actor_id: actorId, media_url: mediaUrl, media_type: "imagen", display_order: displayOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteActorMedia(mediaId) {
  const { error } = await supabase.from("actor_media").delete().eq("id", mediaId);
  if (error) throw error;
}

export async function setActorMediaOrder(mediaId, displayOrder) {
  const { error } = await supabase
    .from("actor_media")
    .update({ display_order: displayOrder })
    .eq("id", mediaId);
  if (error) throw error;
}

// Intercambia el orden de dos elementos adyacentes — mecanismo de
// reordenamiento simple (flechas arriba/abajo), sin arrastrar y soltar.
export async function swapActorMediaOrder(a, b) {
  await Promise.all([setActorMediaOrder(a.id, b.display_order), setActorMediaOrder(b.id, a.display_order)]);
}
