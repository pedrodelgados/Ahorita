import { supabase } from "./supabaseClient";

// Fase 4, Bloque 3 (ver FASE4_CONTRATO_ARQUITECTONICO.md): Promociones
// alimentan el Feed, reutilizando el núcleo de Publicación (Bloque 2).
export const PROMOTION_BENEFIT_MIN_LENGTH = 10;

// Estados públicos: los únicos que corresponde mostrar en el Feed o en el
// perfil a un visitante — "programada_lejana" (más de 24h antes de
// empezar), "borrador" y "oculto" nunca se muestran fuera de quien
// administra.
const PUBLIC_STATUSES = new Set(["programada_proxima", "vigente", "finalizada_reciente"]);

export function isPublicPromotionStatus(status) {
  return PUBLIC_STATUSES.has(status);
}

export async function canAuthorPromotion(actorId) {
  const { data, error } = await supabase.rpc("actor_can_author_promotion", { check_actor_id: actorId });
  if (error) throw error;
  return data === true;
}

async function getComputedStatus(publicationId) {
  const { data, error } = await supabase.rpc("promotion_status", { p_publication_id: publicationId });
  if (error) throw error;
  return data;
}

// Todo el historial del negocio (Centro del Negocio) — la propia RLS ya
// resuelve qué puede ver quién; el estado calculado se obtiene por fila
// porque aquí sí importa distinguir programada_lejana/finalizada de sus
// contrapartes recientes para el propietario.
export async function listActorPromotions(actorId) {
  const { data, error } = await supabase
    .from("publications")
    .select("*, details:promotion_details(*)")
    .eq("actor_id", actorId)
    .eq("subtype", "promocion")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const withStatus = await Promise.all(
    data.map(async (row) => ({
      ...normalizePromotion(row),
      computedStatus: await getComputedStatus(row.id),
    }))
  );
  return withStatus;
}

export async function listPublicActorPromotions(actorId) {
  const all = await listActorPromotions(actorId);
  return all.filter((p) => p.status === "publicado" && isPublicPromotionStatus(p.computedStatus));
}

// Fuente del Feed — función pública estrecha (list_feed_promotions) que ya
// filtra por estado calculado público, evitando traer y descartar en el
// cliente lo que no corresponde mostrar.
export async function listPublishedFeedPromotions() {
  const { data, error } = await supabase.rpc("list_feed_promotions");
  if (error) throw error;

  const actorIds = [...new Set(data.map((row) => row.actor_id))];
  const badgeEntries = await Promise.all(
    actorIds.map(async (id) => [id, await getVerificationBadge(id)])
  );
  const badgeByActor = new Map(badgeEntries);

  return data.map((row) => ({
    id: row.publication_id,
    actorId: row.actor_id,
    computedStatus: row.computed_status,
    title: row.title,
    benefitDescription: row.benefit_description,
    redemptionCondition: row.redemption_condition,
    restrictions: row.restrictions,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    endedEarlyAt: row.ended_early_at,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
    authorName: row.display_name,
    authorType: row.actor_type,
    verificationBadge: badgeByActor.get(row.actor_id) ?? "no_verificado",
  }));
}

async function getVerificationBadge(actorId) {
  const { data, error } = await supabase.rpc("actor_verification_badge", { check_actor_id: actorId });
  if (error) throw error;
  return data;
}

function normalizePromotion(row) {
  const details = Array.isArray(row.details) ? row.details[0] : row.details;
  return {
    id: row.id,
    actorId: row.actor_id,
    status: row.status,
    createdAt: row.created_at,
    publishedAt: row.published_at,
    title: details?.title ?? "",
    benefitDescription: details?.benefit_description ?? "",
    redemptionCondition: details?.redemption_condition ?? "",
    restrictions: details?.restrictions ?? null,
    startsAt: details?.starts_at,
    endsAt: details?.ends_at,
    endedEarlyAt: details?.ended_early_at,
    imageUrl: details?.image_url ?? null,
    previousPrice: details?.previous_price ?? null,
    promoPrice: details?.promo_price ?? null,
    discountPercentage: details?.discount_percentage ?? null,
  };
}

export async function createPromotionDraft(actorId, fields) {
  const { data: publication, error } = await supabase
    .from("publications")
    .insert({ actor_id: actorId, subtype: "promocion", status: "borrador" })
    .select()
    .single();
  if (error) throw error;

  const { error: detailsError } = await supabase.from("promotion_details").insert({
    publication_id: publication.id,
    title: fields.title,
    benefit_description: fields.benefitDescription,
    redemption_condition: fields.redemptionCondition,
    restrictions: fields.restrictions || null,
    starts_at: fields.startsAt,
    ends_at: fields.endsAt,
    image_url: fields.imageUrl || null,
    previous_price: fields.previousPrice || null,
    promo_price: fields.promoPrice || null,
    discount_percentage: fields.discountPercentage || null,
  });
  if (detailsError) throw detailsError;

  return publication.id;
}

export async function updatePromotionContent(publicationId, fields) {
  const { error } = await supabase
    .from("promotion_details")
    .update({
      title: fields.title,
      benefit_description: fields.benefitDescription,
      redemption_condition: fields.redemptionCondition,
      restrictions: fields.restrictions || null,
      starts_at: fields.startsAt,
      ends_at: fields.endsAt,
      image_url: fields.imageUrl || null,
      previous_price: fields.previousPrice || null,
      promo_price: fields.promoPrice || null,
      discount_percentage: fields.discountPercentage || null,
    })
    .eq("publication_id", publicationId);
  if (error) throw error;
}

export async function setPromotionStatus(publicationId, status) {
  const { error } = await supabase.from("publications").update({ status }).eq("id", publicationId);
  if (error) throw error;
}

export async function endPromotionEarly(publicationId) {
  const { error } = await supabase
    .from("promotion_details")
    .update({ ended_early_at: new Date().toISOString() })
    .eq("publication_id", publicationId);
  if (error) throw error;
}

export async function deletePromotion(publicationId) {
  const { error } = await supabase.from("publications").delete().eq("id", publicationId);
  if (error) throw error;
}

export function describePromotionError(error) {
  const code = error?.code;
  if (code === "23514") return "El contenido no cumple una de las reglas de la promoción.";
  if (code === "42501" || /row-level security|verificación vigente/i.test(error?.message || "")) {
    return "No tienes permiso para hacer esto — puede que tu verificación haya vencido.";
  }
  if (error?.message?.includes("Failed to fetch")) return "Sin conexión. Intenta de nuevo.";
  return "No se pudo guardar. Intenta de nuevo.";
}
