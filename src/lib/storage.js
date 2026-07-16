import { supabase } from "./supabaseClient";

export async function uploadMedia(file, ownerId) {
  const ext = file.name.split(".").pop();
  const path = `${ownerId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
