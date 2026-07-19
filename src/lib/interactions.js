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

// Entrega 6: seguimiento persona->persona migrado de `follows` a
// `interactions` — misma tabla y mismas reglas que seguir un negocio, ya
// que ambos son simplemente "seguir un actor". Devuelve profile_id (no
// actor_id) para que FollowContext pueda mantener exactamente la misma
// forma pública (`followingIds: Set<profileId>`) que ya usa AuthorTag, sin
// que ese componente necesite saber que por debajo cambió el modelo.
export async function listFollowedProfileIds(viewerProfileId) {
  const myActorId = await getMyActorId(viewerProfileId);
  const { data, error } = await supabase
    .from("interactions")
    .select("target_id")
    .eq("actor_id", myActorId)
    .eq("type", "seguimiento")
    .eq("target_type", "actor");
  if (error) throw error;
  const targetActorIds = data.map((r) => r.target_id);
  if (targetActorIds.length === 0) return [];

  const { data: actors, error: actorsError } = await supabase
    .from("actors")
    .select("profile_id")
    .in("id", targetActorIds)
    .eq("type", "persona");
  if (actorsError) throw actorsError;
  return actors.map((a) => a.profile_id);
}

// Fase 4, Bloque 2: me gusta/guardado sobre Publicaciones, reutilizando la
// misma tabla `interactions` (target_type ya era texto libre, sin enum que
// ampliar) — funciones nuevas y separadas de las de Actor de arriba para no
// tocar ni arriesgar ese código ya probado en la Entrega 6. "Compartir"
// como interacción registrada queda, a propósito, para el Bloque 4 de esta
// misma fase (ver FASE4_CONTRATO_ARQUITECTONICO.md).
export async function getPublicationInteractionCounts(publicationId) {
  const [likes, saves] = await Promise.all([
    supabase
      .from("interactions")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "publicacion")
      .eq("target_id", publicationId)
      .eq("type", "me_gusta"),
    supabase
      .from("interactions")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "publicacion")
      .eq("target_id", publicationId)
      .eq("type", "guardado"),
  ]);
  if (likes.error) throw likes.error;
  if (saves.error) throw saves.error;
  return { meGusta: likes.count ?? 0, guardados: saves.count ?? 0 };
}

export async function getMyPublicationInteractions(viewerProfileId, publicationId) {
  const myActorId = await getMyActorId(viewerProfileId);
  const { data, error } = await supabase
    .from("interactions")
    .select("type")
    .eq("actor_id", myActorId)
    .eq("target_type", "publicacion")
    .eq("target_id", publicationId)
    .in("type", ["me_gusta", "guardado"]);
  if (error) throw error;
  return {
    meGusta: data.some((r) => r.type === "me_gusta"),
    guardado: data.some((r) => r.type === "guardado"),
  };
}

export async function togglePublicationInteraction({ viewerProfileId, publicationId, type, active }) {
  const myActorId = await getMyActorId(viewerProfileId);
  if (active) {
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("actor_id", myActorId)
      .eq("type", type)
      .eq("target_type", "publicacion")
      .eq("target_id", publicationId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("interactions")
      .insert({ actor_id: myActorId, type, target_type: "publicacion", target_id: publicationId });
    if (error) throw error;
  }
}

// Fase 4, Bloque 3: me gusta/guardado sobre Promociones — mismo patrón que
// las de Publicación (Bloque 2), con su propio target_type ("promocion")
// para no mezclar los conteos con los de Publicación regular aunque ambas
// vivan sobre el mismo núcleo `publications`. Sin "quiero_ir" (pertenece a
// Eventos, ajuste de producto aprobado) ni "compartir" registrado todavía
// (Bloque 4 de esta misma fase).
export async function getPromotionInteractionCounts(publicationId) {
  const [likes, saves] = await Promise.all([
    supabase
      .from("interactions")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "promocion")
      .eq("target_id", publicationId)
      .eq("type", "me_gusta"),
    supabase
      .from("interactions")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "promocion")
      .eq("target_id", publicationId)
      .eq("type", "guardado"),
  ]);
  if (likes.error) throw likes.error;
  if (saves.error) throw saves.error;
  return { meGusta: likes.count ?? 0, guardados: saves.count ?? 0 };
}

export async function getMyPromotionInteractions(viewerProfileId, publicationId) {
  const myActorId = await getMyActorId(viewerProfileId);
  const { data, error } = await supabase
    .from("interactions")
    .select("type")
    .eq("actor_id", myActorId)
    .eq("target_type", "promocion")
    .eq("target_id", publicationId)
    .in("type", ["me_gusta", "guardado"]);
  if (error) throw error;
  return {
    meGusta: data.some((r) => r.type === "me_gusta"),
    guardado: data.some((r) => r.type === "guardado"),
  };
}

export async function togglePromotionInteraction({ viewerProfileId, publicationId, type, active }) {
  const myActorId = await getMyActorId(viewerProfileId);
  if (active) {
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("actor_id", myActorId)
      .eq("type", type)
      .eq("target_type", "promocion")
      .eq("target_id", publicationId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("interactions")
      .insert({ actor_id: myActorId, type, target_type: "promocion", target_id: publicationId });
    if (error) throw error;
  }
}

// Traduce un error real de Postgres/PostgREST a un mensaje breve y
// comprensible — nunca un fallo silencioso (Entrega 6). El bloqueo de
// autointeracción (código 23514, ver migración 0027) ya trae su propio
// mensaje en español listo para mostrar tal cual.
export function describeInteractionError(error) {
  if (!error) return "Algo salió mal. Intenta de nuevo.";
  if (error.code === "23514") return error.message;
  if (error.code === "23505") return "Ya habías hecho esto.";
  if (error.code === "42501" || /row-level security/i.test(error.message ?? "")) {
    return "No tienes permiso para hacer esto.";
  }
  if (error.message === "Failed to fetch" || error.name === "TypeError") {
    return "No se pudo conectar. Intenta de nuevo.";
  }
  return "No se pudo completar la acción. Intenta de nuevo.";
}
