// Fase 5B, Bloque 1: parcialmente legacy. `listLikeCounts`/`listMyLikedIds`/
// `likeTarget`/`unlikeTarget` para 'event'/'place' ya no las usa el frontend
// (ver lib/interactions.js) — el check constraint de post_likes.target_type
// ya no admite filas nuevas de esos dos tipos. Este módulo sigue vivo y
// vigente para 'status'/'question' (Comunidad), sin ningún cambio.
import { supabase } from "./supabaseClient";

export async function listLikeCounts(targetType, targetIds) {
  if (targetIds.length === 0) return {};
  const { data, error } = await supabase
    .from("post_like_counts")
    .select("target_id, likes_count")
    .eq("target_type", targetType)
    .in("target_id", targetIds);
  if (error) throw error;
  return Object.fromEntries(data.map((row) => [row.target_id, row.likes_count]));
}

export async function listMyLikedIds(userId, targetType) {
  const { data, error } = await supabase
    .from("post_likes")
    .select("target_id")
    .eq("user_id", userId)
    .eq("target_type", targetType);
  if (error) throw error;
  return data.map((row) => row.target_id);
}

export async function likeTarget(userId, targetType, targetId) {
  const { error } = await supabase
    .from("post_likes")
    .insert({ user_id: userId, target_type: targetType, target_id: targetId });
  if (error) throw error;
}

export async function unlikeTarget(userId, targetType, targetId) {
  const { error } = await supabase
    .from("post_likes")
    .delete()
    .eq("user_id", userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId);
  if (error) throw error;
}
