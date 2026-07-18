import { supabase } from "./supabaseClient";

// Seguir/guardar un actor de CUALQUIER tipo (persona o negocio), reutilizando
// `interactions` (Fase 1, Bloque 4) — la tabla ya existía con la forma
// correcta (actor_id/type/target_type/target_id) y su propia RLS, pero
// hasta ahora ningún flujo del frontend escribía en ella todavía (las
// pantallas existentes usan `follows`/`saved_places`, que solo admiten
// como objetivo a una persona o un lugar, nunca a un negocio). No fue
// necesaria ninguna migración: es la primera vez que el frontend usa esta
// tabla para lo que fue diseñada.
async function getMyActorId(profileId) {
  const { data, error } = await supabase
    .from("actors")
    .select("id")
    .eq("profile_id", profileId)
    .single();
  if (error) throw error;
  return data.id;
}

export async function getActorInteractionCounts(actorId) {
  const [saved, followed] = await Promise.all([
    supabase
      .from("interactions")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "actor")
      .eq("target_id", actorId)
      .eq("type", "guardado"),
    supabase
      .from("interactions")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "actor")
      .eq("target_id", actorId)
      .eq("type", "seguimiento"),
  ]);
  if (saved.error) throw saved.error;
  if (followed.error) throw followed.error;
  return { guardados: saved.count ?? 0, seguidores: followed.count ?? 0 };
}

export async function getMyActorInteractions(viewerProfileId, targetActorId) {
  const myActorId = await getMyActorId(viewerProfileId);
  const { data, error } = await supabase
    .from("interactions")
    .select("type")
    .eq("actor_id", myActorId)
    .eq("target_type", "actor")
    .eq("target_id", targetActorId)
    .in("type", ["seguimiento", "guardado"]);
  if (error) throw error;
  return {
    following: data.some((r) => r.type === "seguimiento"),
    saved: data.some((r) => r.type === "guardado"),
  };
}

export async function toggleActorInteraction({ viewerProfileId, targetActorId, type, active }) {
  const myActorId = await getMyActorId(viewerProfileId);
  if (active) {
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("actor_id", myActorId)
      .eq("type", type)
      .eq("target_type", "actor")
      .eq("target_id", targetActorId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("interactions")
      .insert({ actor_id: myActorId, type, target_type: "actor", target_id: targetActorId });
    if (error) throw error;
  }
}
