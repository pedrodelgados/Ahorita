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

// Único punto de entrada real a este perfil en la Entrega 1: "Mis negocios"
// en ProfilePage necesita el actor_id de un negocio para poder enlazar a
// /actor/:actorId (la ruta trabaja siempre sobre actor_id, nunca business_id
// directamente, para no bifurcar el concepto de "perfil").
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

export async function getActorIdForBusiness(businessId) {
  const { data, error } = await supabase
    .from("actors")
    .select("id")
    .eq("business_id", businessId)
    .single();
  if (error) throw error;
  return data.id;
}
