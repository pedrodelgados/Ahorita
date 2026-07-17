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
