import { supabase } from "./supabaseClient";

// Fase 6, Bloque 1 (Motor de Afinidad): capa de datos del perfil de
// afinidad. Solo envuelve las dos funciones `security definer` que ya
// gobiernan toda la lectura/escritura — nunca consulta
// `affinity_contributions` directamente, porque esa tabla no tiene ninguna
// política de RLS que lo permita (ver FASE6_CONTRATO_ARQUITECTONICO.md).

export async function getAffinityProfile(actorId) {
  const { data, error } = await supabase.rpc("affinity_profile", {
    check_actor_id: actorId,
  });
  if (error) throw error;
  return data ?? [];
}

export async function applyAffinityCorrection({ category, followedActorId, correction }) {
  const { error } = await supabase.rpc("apply_affinity_correction", {
    p_category: category ?? null,
    p_followed_actor_id: followedActorId ?? null,
    p_correction: correction,
  });
  if (error) throw error;
}
