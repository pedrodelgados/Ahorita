import { supabase } from "./supabaseClient";

export async function listUpcomingEvents({ channel } = {}) {
  const nowIso = new Date().toISOString();
  let query = supabase
    .from("events")
    .select("*, business:businesses(name)")
    .or(`end_at.gte.${nowIso},and(end_at.is.null,start_at.gte.${nowIso})`)
    .order("start_at", { ascending: true });
  if (channel) query = query.eq("category", channel);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getEvent(id) {
  const { data, error } = await supabase
    .from("events")
    .select("*, business:businesses(name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createEvent(payload) {
  const { data, error } = await supabase.from("events").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function listEventComments(eventId) {
  const { data, error } = await supabase
    .from("event_comments")
    .select("*, author:profiles(id, username, avatar_url)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createEventComment({ eventId, text, authorId }) {
  const { data, error } = await supabase
    .from("event_comments")
    .insert({ event_id: eventId, text, author_id: authorId })
    .select("*, author:profiles(id, username, avatar_url)")
    .single();
  if (error) throw error;
  return data;
}
