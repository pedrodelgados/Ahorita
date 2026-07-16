import { supabase } from "./supabaseClient";

export async function listFollowingIds(userId) {
  const { data, error } = await supabase
    .from("follows")
    .select("followed_id")
    .eq("follower_id", userId);
  if (error) throw error;
  return data.map((row) => row.followed_id);
}

export async function follow(followerId, followedId) {
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, followed_id: followedId });
  if (error) throw error;
}

export async function unfollow(followerId, followedId) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("followed_id", followedId);
  if (error) throw error;
}
