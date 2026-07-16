import { supabase } from "./supabaseClient";

export async function listQuestions(placeId) {
  const { data, error } = await supabase
    .from("questions")
    .select("*, author:profiles(id, username, avatar_url), answers(*, author:profiles(id, username, avatar_url))")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createQuestion({ placeId, channel, text, authorId }) {
  const { data, error } = await supabase
    .from("questions")
    .insert({ place_id: placeId, channel, text, author_id: authorId })
    .select("*, author:profiles(id, username, avatar_url), answers(*, author:profiles(id, username, avatar_url))")
    .single();
  if (error) throw error;
  return data;
}

export async function createAnswer({ questionId, text, authorId }) {
  const { data, error } = await supabase
    .from("answers")
    .insert({ question_id: questionId, text, author_id: authorId })
    .select("*, author:profiles(id, username, avatar_url)")
    .single();
  if (error) throw error;
  return data;
}

export async function likeAnswer(answerId, currentLikes) {
  const { data, error } = await supabase
    .from("answers")
    .update({ likes_count: currentLikes + 1 })
    .eq("id", answerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listUnverifiedAnswers(limit = 20) {
  const { data, error } = await supabase
    .from("answers")
    .select("*, question:questions(text, place:places(name))")
    .eq("verified", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function setAnswerVerified(answerId, verified) {
  const { data, error } = await supabase
    .from("answers")
    .update({ verified })
    .eq("id", answerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
