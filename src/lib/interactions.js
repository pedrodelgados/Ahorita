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

// Fase 5B, Bloque 1: me gusta/guardado sobre Eventos y Lugares — mismo
// patrón que Publicación/Promoción (Bloque 2/3 de la Fase 4), cerrando el
// "cambio de fuente de verdad" que quedó pendiente desde la Fase 1, Bloque 4
// (que solo copió los datos históricos, sin migrar quién los lee/escribe).
// `post_likes`/`saved_events`/`saved_places` dejan de ser la fuente activa
// para estos dos tipos; Comunidad (status/question) sigue exactamente igual
// sobre `post_likes`, sin ningún cambio.
//
// Estas dos siguen siendo lecturas *masivas* (todos los eventos que el
// usuario likeó/guardó, en una sola consulta) — las usa FeedPage/
// SavedEventsContext para poblar el estado de muchas tarjetas a la vez, un
// caso de uso distinto al de una sola tarjeta/detalle (ver más abajo).
export async function listMyLikedEventIds(viewerProfileId) {
  const myActorId = await getMyActorId(viewerProfileId);
  const { data, error } = await supabase
    .from("interactions")
    .select("target_id")
    .eq("actor_id", myActorId)
    .eq("type", "me_gusta")
    .eq("target_type", "event");
  if (error) throw error;
  return data.map((r) => r.target_id);
}

export async function listMySavedEventIds(viewerProfileId) {
  const myActorId = await getMyActorId(viewerProfileId);
  const { data, error } = await supabase
    .from("interactions")
    .select("target_id")
    .eq("actor_id", myActorId)
    .eq("type", "guardado")
    .eq("target_type", "event");
  if (error) throw error;
  return data.map((r) => r.target_id);
}

// Fase 5B, Bloque 2: capa coherente para las cuatro interacciones posibles
// sobre un Evento (me_gusta/quiero_ir/ya_fui/guardado) — reemplaza
// `toggleEventLike` del Bloque 1, que era una función dedicada a un solo
// tipo; mismo espíritu de generalización que `toggleActorInteraction`
// (Entrega 6, Fase 3). `EVENT_INTERACTION_TYPES` es una lista de permiso
// para este contexto, no el catálogo completo de `interactions.type` — a
// propósito, para que nadie pueda pasar por aquí un tipo que no tiene
// sentido sobre un Evento (por ejemplo "seguimiento", que es de Actor).
const EVENT_INTERACTION_TYPES = ["me_gusta", "quiero_ir", "ya_fui", "guardado"];

// Lectura de UN evento a la vez (EventSheet) — distinta de las lecturas
// masivas de arriba, pensada para el detalle, no para el scroll del feed.
export async function getMyEventReactions(viewerProfileId, eventId) {
  const myActorId = await getMyActorId(viewerProfileId);
  const { data, error } = await supabase
    .from("interactions")
    .select("type")
    .eq("actor_id", myActorId)
    .eq("target_type", "event")
    .eq("target_id", eventId)
    .in("type", EVENT_INTERACTION_TYPES);
  if (error) throw error;
  return {
    meGusta: data.some((r) => r.type === "me_gusta"),
    quieroIr: data.some((r) => r.type === "quiero_ir"),
    yaFui: data.some((r) => r.type === "ya_fui"),
    guardado: data.some((r) => r.type === "guardado"),
  };
}

// Conteos públicos de "Quiero ir"/"Ya fui" — en vivo, sin columna
// desnormalizada ni trigger de conteo (decisión explícita del Bloque 2: sin
// necesidad de rendimiento real todavía que lo justifique). "Guardado" no
// se cuenta aquí ni en ningún otro lugar de la aplicación — es privado.
export async function getEventReactionCounts(eventId) {
  const [quieroIr, yaFui] = await Promise.all([
    supabase
      .from("interactions")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "event")
      .eq("target_id", eventId)
      .eq("type", "quiero_ir"),
    supabase
      .from("interactions")
      .select("id", { count: "exact", head: true })
      .eq("target_type", "event")
      .eq("target_id", eventId)
      .eq("type", "ya_fui"),
  ]);
  if (quieroIr.error) throw quieroIr.error;
  if (yaFui.error) throw yaFui.error;
  return { quieroIr: quieroIr.count ?? 0, yaFui: yaFui.count ?? 0 };
}

// Única función de escritura para las cuatro interacciones de un Evento.
// La compuerta temporal de "quiero_ir"/"ya_fui" (ver migración 0033) vive en
// la base de datos, no aquí — este código nunca decide si el momento es
// válido, solo intenta la operación y deja que `describeInteractionError`
// traduzca el rechazo (código 23514) a un mensaje legible si ocurre.
export async function toggleEventInteraction({ viewerProfileId, eventId, type, active }) {
  if (!EVENT_INTERACTION_TYPES.includes(type)) {
    throw new Error(`Tipo de interacción no permitido para un Evento: ${type}`);
  }
  const myActorId = await getMyActorId(viewerProfileId);
  if (active) {
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("actor_id", myActorId)
      .eq("type", type)
      .eq("target_type", "event")
      .eq("target_id", eventId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("interactions")
      .insert({ actor_id: myActorId, type, target_type: "event", target_id: eventId });
    if (error) throw error;
  }
}

// `toggleSavedEvent` (Bloque 1) delega en la función de arriba en vez de
// duplicar el mismo cuerpo — SavedEventsContext sigue llamándola igual,
// sin necesitar ningún cambio.
export async function toggleSavedEvent({ viewerProfileId, eventId, active }) {
  return toggleEventInteraction({ viewerProfileId, eventId, type: "guardado", active });
}

export async function listMySavedPlaceIds(viewerProfileId) {
  const myActorId = await getMyActorId(viewerProfileId);
  const { data, error } = await supabase
    .from("interactions")
    .select("target_id")
    .eq("actor_id", myActorId)
    .eq("type", "guardado")
    .eq("target_type", "place")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => r.target_id);
}

export async function toggleSavedPlace({ viewerProfileId, placeId, active }) {
  const myActorId = await getMyActorId(viewerProfileId);
  if (active) {
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("actor_id", myActorId)
      .eq("type", "guardado")
      .eq("target_type", "place")
      .eq("target_id", placeId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("interactions")
      .insert({ actor_id: myActorId, type: "guardado", target_type: "place", target_id: placeId });
    if (error) throw error;
  }
}

// Equivalente a `listSavedPlaces` (lib/savedPlaces.js, ahora legacy), pero
// sobre `interactions` — sin relación formal de clave foránea con `places`
// (`target_id` es polimórfico), así que se resuelve en dos pasos, mismo
// patrón ya usado por `listFollowedProfileIds` (Entrega 6, Fase 3).
export async function listMySavedPlaces(viewerProfileId) {
  const placeIds = await listMySavedPlaceIds(viewerProfileId);
  if (placeIds.length === 0) return [];
  const { data, error } = await supabase.from("places").select("*").in("id", placeIds);
  if (error) throw error;
  const order = new Map(placeIds.map((id, i) => [id, i]));
  return data.sort((a, b) => order.get(a.id) - order.get(b.id));
}

// Fase 4, Bloque 4: "compartir" como señal medible, para Evento, Publicación,
// Promoción y Actor (persona/negocio) por igual — un único punto de escritura
// reutilizado por `useShareContent` (ver src/hooks/useShareContent.js) en vez
// de que cada tarjeta registre su propia interacción. El `unique(actor_id,
// type, target_type, target_id)` ya existe desde el Bloque 1 de la Fase 1
// (pensado desde el inicio para esto): compartir el mismo contenido varias
// veces nunca crea filas nuevas, así que un conflicto de unicidad (23505) es
// el resultado esperado de un segundo intento, no un error — la señal
// significa "esta persona compartió esto al menos una vez", nunca una
// cuenta de repeticiones.
export async function registerShare({ viewerProfileId, targetType, targetId }) {
  const myActorId = await getMyActorId(viewerProfileId);
  const { error } = await supabase
    .from("interactions")
    .insert({ actor_id: myActorId, type: "compartir", target_type: targetType, target_id: targetId });
  if (error && error.code !== "23505") throw error;
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
