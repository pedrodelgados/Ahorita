import { supabase } from "./supabaseClient";

export async function listSavedPlaces(userId) {
  const { data, error } = await supabase
    .from("saved_places")
    .select("place_id, places(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => row.places);
}

export async function listSavedPlaceIds(userId) {
  const { data, error } = await supabase
    .from("saved_places")
    .select("place_id")
    .eq("user_id", userId);
  if (error) throw error;
  return data.map((row) => row.place_id);
}

export async function savePlace(userId, placeId) {
  const { error } = await supabase
    .from("saved_places")
    .insert({ user_id: userId, place_id: placeId });
  if (error) throw error;
}

export async function unsavePlace(userId, placeId) {
  const { error } = await supabase
    .from("saved_places")
    .delete()
    .eq("user_id", userId)
    .eq("place_id", placeId);
  if (error) throw error;
}
