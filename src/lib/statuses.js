import { supabase } from "./supabaseClient";
import { uploadMedia } from "./storage";

export async function listStatuses(placeId) {
  const { data, error } = await supabase
    .from("statuses")
    .select("*")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createStatus({ placeId, channel, text, authorId, mediaFile }) {
  let media_url = null;
  let media_type = null;

  if (mediaFile) {
    media_url = await uploadMedia(mediaFile, authorId);
    media_type = mediaFile.type.startsWith("video") ? "video" : "image";
  }

  const { data, error } = await supabase
    .from("statuses")
    .insert({ place_id: placeId, channel, text, author_id: authorId, media_url, media_type })
    .select()
    .single();
  if (error) throw error;
  return data;
}
