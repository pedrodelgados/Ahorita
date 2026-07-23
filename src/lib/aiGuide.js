import { supabase } from "./supabaseClient";

// Fase 7, Bloque 2 (Memoria de Sesión): para una persona autenticada, el
// servidor ya conserva el hilo -- solo se envía el turno nuevo. Para un
// invitado, el cliente sigue siendo la única fuente de verdad (sin cambios
// respecto al Bloque 1): se reenvía `guestHistory` en cada turno.
export async function askGuide({ text, placeId, guestHistory }) {
  const { data, error } = await supabase.functions.invoke("ai-guide", {
    body: { text, placeId, guestHistory },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}

// Hidratación al abrir el chat -- para un invitado siempre devuelve "sin
// conversación que recuperar" (nunca hay persistencia server-side para
// invitados).
export async function getConversationStatus() {
  const { data, error } = await supabase.functions.invoke("ai-guide", {
    body: { action: "get_conversation" },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}

// Solo se llama tras el consentimiento explícito de la persona al crear
// una cuenta a mitad de una conversación de invitado (ver GuideChat.jsx).
export async function importGuestConversation(guestHistory) {
  const { data, error } = await supabase.functions.invoke("ai-guide", {
    body: { action: "import_guest_conversation", guestHistory },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}

export async function deleteActiveConversation() {
  const { data, error } = await supabase.functions.invoke("ai-guide", {
    body: { action: "delete_conversation" },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}
