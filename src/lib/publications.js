import { supabase } from "./supabaseClient";

// Fase 4, Bloque 2 (ver FASE4_CONTRATO_ARQUITECTONICO.md): Publicaciones
// alimentan el Feed. Límite de contenido igual al ya exigido en la base de
// datos (ajuste 2 de producto) — una sola fuente de verdad para el límite,
// nunca dos números que puedan desalinearse.
export const PUBLICATION_BODY_MAX_LENGTH = 500;

// El Actor de sistema "Ahorita Editorial" ya viene seedado desde la Fase 1
// (decisión 12 del MASTERPLAN.md) — se recupera por nombre, nunca se
// hardcodea su id.
export async function getAhoritaEditorialActorId() {
  const { data, error } = await supabase
    .from("actors")
    .select("id")
    .eq("type", "sistema")
    .eq("display_name", "Ahorita Editorial")
    .single();
  if (error) throw error;
  return data.id;
}

export async function canAuthorPublication(actorId) {
  const { data, error } = await supabase.rpc("actor_can_author_publication", {
    check_actor_id: actorId,
  });
  if (error) throw error;
  return data === true;
}

// Todo el historial del actor (Centro del Negocio): la propia RLS ya
// resuelve qué estados puede ver quién — el dueño/administrador ve los
// tres, un visitante solo vería "publicado" si llamara a esta misma
// función (no se usa así; los visitantes usan listPublishedActorPublications).
export async function listActorPublications(actorId) {
  const { data, error } = await supabase
    .from("publications")
    .select("*, post:publication_posts(*)")
    .eq("actor_id", actorId)
    .eq("subtype", "publicacion")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(normalizePublication);
}

// Solo lo publicado de un actor — para quien visita su perfil sin poder
// administrarlo.
export async function listPublishedActorPublications(actorId) {
  const { data, error } = await supabase
    .from("publications")
    .select("*, post:publication_posts(*)")
    .eq("actor_id", actorId)
    .eq("subtype", "publicacion")
    .eq("status", "publicado")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data.map(normalizePublication);
}

// Fuente del Feed (Bloque 1: mergeFeedSources) — solo contenido publicado,
// de cualquier actor, con la insignia de verificación de su autor para que
// el feed distinga negocio verificado de no verificado sin una consulta
// aparte por tarjeta.
export async function listPublishedFeedPublications() {
  const { data, error } = await supabase
    .from("publications")
    .select("*, post:publication_posts(*), actor:actors(display_name, type)")
    .eq("subtype", "publicacion")
    .eq("status", "publicado")
    .order("published_at", { ascending: false });
  if (error) throw error;

  const actorIds = [...new Set(data.map((row) => row.actor_id))];
  const badgeEntries = await Promise.all(
    actorIds.map(async (id) => [id, await getVerificationBadge(id)])
  );
  const badgeByActor = new Map(badgeEntries);

  return data.map((row) => ({
    ...normalizePublication(row),
    verificationBadge: badgeByActor.get(row.actor_id) ?? "no_verificado",
  }));
}

// Fase 5B, Bloque 3: detalle de una Publicación (ruta /publicacion/:id) —
// la propia RLS de `publications` ya decide qué puede ver el visitante
// (publicada, o borrador/oculta si es su dueño o admin), la misma que ya
// usa `enforce_comment_rules` en la base de datos para decidir si admite
// comentarios — no se repite ese criterio aquí, solo se deja que la
// consulta falle (fila inexistente) si no hay permiso.
export async function getPublication(publicationId) {
  const { data, error } = await supabase
    .from("publications")
    .select("*, post:publication_posts(*), actor:actors(display_name, type)")
    .eq("id", publicationId)
    .eq("subtype", "publicacion")
    .single();
  if (error) throw error;
  const badge = await getVerificationBadge(data.actor_id);
  return { ...normalizePublication(data), verificationBadge: badge };
}

async function getVerificationBadge(actorId) {
  const { data, error } = await supabase.rpc("actor_verification_badge", {
    check_actor_id: actorId,
  });
  if (error) throw error;
  return data;
}

function normalizePublication(row) {
  const post = Array.isArray(row.post) ? row.post[0] : row.post;
  const edited =
    !!row.published_at && !!post?.updated_at && new Date(post.updated_at) > new Date(row.published_at);
  return {
    id: row.id,
    actorId: row.actor_id,
    status: row.status,
    createdAt: row.created_at,
    publishedAt: row.published_at,
    edited,
    body: post?.body ?? "",
    imageUrl: post?.image_url ?? null,
    category: post?.category ?? null,
    authorName: row.actor?.display_name,
    authorType: row.actor?.type,
  };
}

// Crea siempre en borrador, con su detalle, en el mismo paso — publicar es
// una acción explícita y posterior (setPublicationStatus), nunca implícita
// en la creación. Este orden es lo que garantiza que la detección de
// "Editado" nunca dé un falso positivo justo al publicar por primera vez
// (ver comentario en la migración 0030).
export async function createPublicationDraft(actorId, { body, imageUrl, category }) {
  const { data: publication, error } = await supabase
    .from("publications")
    .insert({ actor_id: actorId, subtype: "publicacion", status: "borrador" })
    .select()
    .single();
  if (error) throw error;

  const { error: postError } = await supabase
    .from("publication_posts")
    .insert({ publication_id: publication.id, body, image_url: imageUrl || null, category: category || null });
  if (postError) throw postError;

  return publication.id;
}

export async function updatePublicationContent(publicationId, { body, imageUrl, category }) {
  const { error } = await supabase
    .from("publication_posts")
    .update({ body, image_url: imageUrl || null, category: category || null })
    .eq("publication_id", publicationId);
  if (error) throw error;
}

export async function setPublicationStatus(publicationId, status) {
  const { error } = await supabase.from("publications").update({ status }).eq("id", publicationId);
  if (error) throw error;
}

export async function deletePublication(publicationId) {
  const { error } = await supabase.from("publications").delete().eq("id", publicationId);
  if (error) throw error;
}

// Mismo espíritu que describeInteractionError (Entrega 6): mensajes breves
// y comprensibles, nunca un mensaje técnico crudo.
export function describePublicationError(error) {
  const code = error?.code;
  if (code === "23514") return "El contenido no cumple una de las reglas de publicación.";
  if (code === "42501" || /row-level security/i.test(error?.message || "")) {
    return "No tienes permiso para hacer esto — puede que tu verificación haya vencido.";
  }
  if (error?.message?.includes("Failed to fetch")) return "Sin conexión. Intenta de nuevo.";
  return "No se pudo guardar. Intenta de nuevo.";
}
