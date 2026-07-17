import { supabase } from "./supabaseClient";

export async function listUpcomingEvents({ channel } = {}) {
  const nowIso = new Date().toISOString();
  let query = supabase
    .from("events")
    .select("*, business:businesses(name)")
    .or(`end_at.gte.${nowIso},and(end_at.is.null,start_at.gte.${nowIso})`)
    .or(`publish_at.is.null,publish_at.lte.${nowIso}`)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
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

// --- Administración (/admin/eventos) ----------------------------------------

export async function listAllEventsForAdmin({ search, category, status, from, to } = {}) {
  let query = supabase
    .from("events")
    .select("*, business:businesses(name)")
    .order("start_at", { ascending: false });

  if (search) query = query.ilike("title", `%${search}%`);
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);
  if (from) query = query.gte("start_at", from);
  if (to) query = query.lte("start_at", to);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateEvent(id, payload) {
  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
