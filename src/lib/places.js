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
