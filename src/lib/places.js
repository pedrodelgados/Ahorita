import { supabase } from "./supabaseClient";

export async function listPlaces({ area, channel } = {}) {
  let query = supabase.from("places").select("*").order("name");
  if (area) query = query.eq("area", area);
  if (channel) query = query.eq("channel_default", channel);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listAreas() {
  const { data, error } = await supabase.from("places").select("area");
  if (error) throw error;
  return [...new Set(data.map((p) => p.area).filter(Boolean))];
}

export async function getPlace(id) {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function searchPlaces(query) {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(30);
  if (error) throw error;
  return data;
}

export async function createPlace(payload) {
  const { data, error } = await supabase.from("places").insert(payload).select().single();
  if (error) throw error;
  return data;
}

// --- Administración (/admin/lugares) -----------------------------------------

export async function listAllPlacesForAdmin({ search, channel, status } = {}) {
  let query = supabase.from("places").select("*").order("name");
  if (search) query = query.ilike("name", `%${search}%`);
  if (channel) query = query.eq("channel_default", channel);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updatePlace(id, payload) {
  const { data, error } = await supabase
    .from("places")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePlace(id) {
  const { error } = await supabase.from("places").delete().eq("id", id);
  if (error) throw error;
}
