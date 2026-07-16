import { supabase } from "./supabaseClient";

export async function askGuide({ messages, placeId }) {
  const { data, error } = await supabase.functions.invoke("ai-guide", {
    body: { messages, placeId },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data.reply;
}
