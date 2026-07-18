import { supabase } from "./supabaseClient";

// Perfil público unificado (Fase 3, Bloque C, Entrega 1): un actor de
// cualquier tipo (persona o negocio) se resuelve a la misma forma de datos,
// reflejando que "perfil" es un concepto del Actor, no de profiles/businesses
// por separado. Ver actors/actor_profile_details (Fase 3, Bloque A).
export async function getPublicActorProfile(actorId) {
  const { data: actor, error: actorError } = await supabase
    .from("actors")
    .select("*")
    .eq("id", actorId)
    .single();
  if (actorError) throw actorError;

  const { data: details, error: detailsError } = await supabase
    .from("actor_profile_details")
    .select("*")
    .eq("actor_id", actorId)
    .maybeSingle();
  if (detailsError) throw detailsError;

  let profile = null;
  let business = null;
  let zone = null;

  if (actor.type === "persona") {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", actor.profile_id)
      .single();
    if (error) throw error;
    profile = data;
  } else if (actor.business_id) {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", actor.business_id)
      .single();
    if (error) throw error;
    business = data;

    if (business.zone_id) {
      const { data: zoneData } = await supabase
        .from("zones")
        .select("name")
        .eq("id", business.zone_id)
        .maybeSingle();
      zone = zoneData;
    }
  }

  return { actor, details, profile, business, zone };
}

export async function getActorVerificationBadge(actorId) {
  const { data, error } = await supabase.rpc("actor_verification_badge", {
    check_actor_id: actorId,
  });
  if (error) throw error;
  return data;
}

export async function getBusinessOpenStatus(businessId) {
  const { data, error } = await supabase
    .rpc("business_open_status", { p_business_id: businessId })
    .single();
  if (error) throw error;
  return data;
}

// Galería (actor_media, Fase 3 Bloque A) — solo medios activos, en el orden
// que definió el propietario o administrador operativo.
export async function listActorMedia(actorId) {
  const { data, error } = await supabase
    .from("actor_media")
    .select("*")
    .eq("actor_id", actorId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

// ¿Puede quien mira ahora editar este actor? Reutiliza la función de
// seguridad ya creada y probada en el Bloque A (dueño legal o administrador
// operativo activo) — ninguna regla de permisos nueva para la Entrega 3.
export async function canEditActor(actorId) {
  const { data, error } = await supabase.rpc("actor_editable_by_current_user", {
    check_actor_id: actorId,
  });
  if (error) throw error;
  return data === true;
}

export async function updateActorProfileDetails(actorId, patch) {
  const { data, error } = await supabase
    .from("actor_profile_details")
    .update(patch)
    .eq("actor_id", actorId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Negocios que el usuario puede gestionar desde el selector de perfil
// (Entrega 5): los que posee legalmente (businesses.owner_id) más los que
// administra de forma operativa y activa (actor_managers, Bloque A),
// combinados en una sola lista — "propietario" tiene precedencia visual
// sobre "administrador" si por algún motivo coincidieran.
export async function listMyManagedActors(profileId) {
  const [ownedResult, managedResult] = await Promise.all([
    supabase
      .from("actors")
      .select("id, display_name, business_id, businesses!inner(id, name, category, image_url, status, owner_id)")
      .eq("businesses.owner_id", profileId),
    supabase
      .from("actor_managers")
      .select("actor_id, actors!inner(id, display_name, business_id, businesses(id, name, category, image_url, status))")
      .eq("manager_profile_id", profileId)
      .is("revoked_at", null),
  ]);
  if (ownedResult.error) throw ownedResult.error;
  if (managedResult.error) throw managedResult.error;

  const byActorId = new Map();

  for (const row of ownedResult.data) {
    byActorId.set(row.id, {
      actorId: row.id,
      displayName: row.display_name,
      business: row.businesses,
      role: "propietario",
    });
  }

  for (const row of managedResult.data) {
    if (byActorId.has(row.actors.id)) continue;
    byActorId.set(row.actors.id, {
      actorId: row.actors.id,
      displayName: row.actors.display_name,
      business: row.actors.businesses,
      role: "administrador",
    });
  }

  return Array.from(byActorId.values());
}

export async function getActorIdForBusiness(businessId) {
  const { data, error } = await supabase
    .from("actors")
    .select("id")
    .eq("business_id", businessId)
    .single();
  if (error) throw error;
  return data.id;
}
