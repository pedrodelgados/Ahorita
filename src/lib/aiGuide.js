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

// Fase 7, Bloque 3 (Conocimiento Permanente no-afinidad): estas funciones
// nunca se llaman como efecto de una respuesta conversacional -- siempre
// como una acción explícita de interfaz (la persona confirmó un candidato
// ya mostrado, o pidió corregir/borrar desde la superficie de
// transparencia).
export async function savePermanentFact({ category, subtype, value, reinforcedConfirmationShown }) {
  const { data, error } = await supabase.functions.invoke("ai-guide", {
    body: { action: "save_permanent_fact", category, subtype, value, reinforcedConfirmationShown },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}

export async function deletePermanentFact({ category, subtype, asRevocation }) {
  const { data, error } = await supabase.functions.invoke("ai-guide", {
    body: { action: "delete_permanent_fact", category, subtype, asRevocation },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}

export async function deleteAllPermanentFacts() {
  const { data, error } = await supabase.functions.invoke("ai-guide", {
    body: { action: "delete_all_permanent_facts" },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}

// Catálogo de categorías: dato de referencia público (RLS lo permite para
// cualquiera) -- se lee directamente, sin pasar por la Edge Function, para
// que el frontend sepa qué categorías exigen confirmación reforzada antes
// de mostrar el candidato que propuso El Razonador.
export async function getPermanentKnowledgeCatalog() {
  const { data, error } = await supabase
    .from("permanent_knowledge_categories")
    .select("category, sensitivity_level, requires_reinforced_confirmation, purpose_template");

  if (error) throw error;
  return data ?? [];
}

// Transparencia: hechos vigentes + resumen de auditoría, para la superficie
// de "qué sabe de mí la Guía IA".
export async function getPermanentKnowledge() {
  const { data, error } = await supabase.functions.invoke("ai-guide", {
    body: { action: "get_permanent_knowledge" },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
}
