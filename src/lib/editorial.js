import { supabase } from "./supabaseClient";

export async function getLatestEditorialPost() {
  const { data, error } = await supabase
    .from("editorial_posts")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
