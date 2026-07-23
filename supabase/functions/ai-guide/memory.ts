// Ahorita — Guía IA, Fase 7 Bloque 2: Memoria de Sesión.
//
// Responsabilidad única (FASE7_CONTRATO_ARQUITECTONICO.md, componente 1):
// dar continuidad al momento presente de la única conversación activa de
// una persona autenticada. Retiene, nunca interpreta -- reconocer una
// corrección o una caducidad sigue siendo, sin excepción, responsabilidad
// de El Razonador (decision.ts). El envoltorio que este módulo produce
// (ConversationalContext) es la única superficie que decision.ts conoce:
// nunca sabe si por debajo hay mensajes literales, contexto estructurado o
// una síntesis -- esa elección es exclusiva de este archivo (representación
// interna elegida hoy: mensajes literales, ver
// 0043_fase7_bloque2_memoria_sesion.sql).
//
// Invitados (sin sesión): este módulo nunca se invoca para ellos -- no
// existe ninguna persistencia server-side para invitados (aprobado
// explícitamente en el diseño técnico). index.ts resuelve la identidad
// antes de decidir si invoca este módulo en absoluto.
//
// Acceso: siempre a través de un cliente con el propio token de quien
// llama (nunca la clave de servicio) -- las funciones `security definer`
// de la migración derivan la identidad exclusivamente de auth.uid(), por
// lo que un identificador de conversación manipulado por el cliente no
// tiene ninguna vía de acceso: no existe tal identificador en ningún
// parámetro de ninguna función.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { MemoryInstruction } from "./decision.ts";

export type Turn = { speaker: "person" | "guide"; content: string; occurredAt: string };

// Único contrato que El Razonador conoce -- nunca sabe cómo se representa
// internamente ni de dónde proviene.
export type ConversationalContext = {
  turns: Turn[];
  conversationStartedAt: string | null;
  now: string;
};

export type ConversationStatusEvent = "continuada" | "nueva" | "expirada";

export type MemoryReadResult = {
  conversationalContext: ConversationalContext;
  statusEvent: ConversationStatusEvent;
  degraded: boolean;
};

function callerClient(authHeader: string): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
}

// Resuelve la identidad real de quien llama a partir de su propio token de
// sesión (mismo patrón ya usado en export-user-data) -- nunca de un
// parámetro que el cliente pueda enviar. Invitado (sin token válido)
// resuelve a null, nunca a un error.
export async function resolveIdentity(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null;
  try {
    const client = callerClient(authHeader);
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

function freshContext(currentMessage: string, now: string): ConversationalContext {
  return {
    turns: [{ speaker: "person", content: currentMessage, occurredAt: now }],
    conversationStartedAt: null,
    now,
  };
}

// Lectura: nunca lanza -- un fallo se degrada a "sin memoria disponible en
// este turno" (degraded: true), nunca bloquea la respuesta -- comportamiento
// de seguridad explícitamente aprobado por el Product Owner.
export async function readConversationalContext(
  authHeader: string,
  currentMessage: string
): Promise<MemoryReadResult> {
  const now = new Date().toISOString();

  try {
    const client = callerClient(authHeader);

    const { data: statusRows, error: statusError } = await client.rpc("ai_get_active_conversation");
    if (statusError) throw statusError;
    const status = statusRows?.[0] as
      | { conversation_status: string; started_at: string | null; last_activity_at: string | null }
      | undefined;

    if (!status || status.conversation_status === "ninguna") {
      return { conversationalContext: freshContext(currentMessage, now), statusEvent: "nueva", degraded: false };
    }
    if (status.conversation_status === "expirada") {
      return { conversationalContext: freshContext(currentMessage, now), statusEvent: "expirada", degraded: false };
    }

    const { data: turnRows, error: turnsError } = await client.rpc("ai_get_conversation_turns");
    if (turnsError) throw turnsError;

    const priorTurns: Turn[] = (turnRows ?? []).map(
      (t: { turn_role: string; content: string; occurred_at: string }) => ({
        speaker: t.turn_role === "person" ? "person" : "guide",
        content: t.content,
        occurredAt: t.occurred_at,
      })
    );

    return {
      conversationalContext: {
        turns: [...priorTurns, { speaker: "person", content: currentMessage, occurredAt: now }],
        conversationStartedAt: status.started_at,
        now,
      },
      statusEvent: "continuada",
      degraded: false,
    };
  } catch (error) {
    console.error("Memoria de Sesión: fallo de lectura, se continúa sin memoria disponible en este turno:", error);
    return { conversationalContext: freshContext(currentMessage, now), statusEvent: "nueva", degraded: true };
  }
}

export type ExistingConversation = {
  statusEvent: ConversationStatusEvent;
  turns: Array<{ role: "user" | "assistant"; content: string }>;
};

// Hidratación al abrir el chat -- nunca invoca a El Razonador ni a La
// Expresión, es una lectura pura de estado para que el frontend pueda
// mostrar (o no) la conversación ya activa antes de que la persona escriba
// nada nuevo. Mismo criterio de degradación honesta: un fallo nunca lanza,
// se trata como "ninguna conversación" en vez de bloquear la apertura del
// chat.
export async function fetchExistingConversation(authHeader: string): Promise<ExistingConversation> {
  try {
    const client = callerClient(authHeader);
    const { data: statusRows, error: statusError } = await client.rpc("ai_get_active_conversation");
    if (statusError) throw statusError;
    const status = statusRows?.[0] as { conversation_status: string } | undefined;

    if (!status || status.conversation_status === "ninguna") {
      return { statusEvent: "nueva", turns: [] };
    }
    if (status.conversation_status === "expirada") {
      return { statusEvent: "expirada", turns: [] };
    }

    const { data: turnRows, error: turnsError } = await client.rpc("ai_get_conversation_turns");
    if (turnsError) throw turnsError;

    const turns = (turnRows ?? []).map((t: { turn_role: string; content: string }) => ({
      role: (t.turn_role === "person" ? "user" : "assistant") as "user" | "assistant",
      content: t.content,
    }));

    return { statusEvent: "continuada", turns };
  } catch (error) {
    console.error("Memoria de Sesión: fallo al hidratar la conversación existente, se muestra como nueva:", error);
    return { statusEvent: "nueva", turns: [] };
  }
}

// Escritura: se invoca únicamente después de que la respuesta ya está
// lista -- nunca antes, para no registrar un turno que terminó fallando.
// ai_append_exchange() es atómica (persona + guía + retractación, si la
// hay, en una sola transacción implícita): nunca deja un turno a medias.
// Un fallo aquí nunca interrumpe la respuesta ya entregada -- solo se
// informa (persisted: false) que ese turno podría no quedar disponible
// para continuar después.
export async function persistExchange(
  authHeader: string,
  personMessage: string,
  guideReply: string,
  memoryInstruction: MemoryInstruction | null
): Promise<{ persisted: boolean }> {
  try {
    const client = callerClient(authHeader);
    const { error } = await client.rpc("ai_append_exchange", {
      p_person_content: personMessage,
      p_guide_content: guideReply,
      p_retraction_scope: memoryInstruction?.action === "retract" ? memoryInstruction.scope : null,
    });
    if (error) throw error;
    return { persisted: true };
  } catch (error) {
    console.error(
      "Memoria de Sesión: fallo de escritura -- este turno podría no quedar disponible para continuar después:",
      error
    );
    return { persisted: false };
  }
}

// Importación de una conversación de invitado ya aceptada explícitamente
// (consentimiento confirmado al crear cuenta a mitad de conversación) --
// reconstruye, en orden, cada turno ya acumulado localmente en el cliente.
// Nunca se invoca sin ese consentimiento explícito (responsabilidad del
// frontend, ver GuideChat.jsx).
export async function importGuestTurns(
  authHeader: string,
  turns: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ imported: boolean }> {
  try {
    const client = callerClient(authHeader);
    for (const turn of turns) {
      const { error } = await client.rpc("ai_append_turn", {
        p_role: turn.role === "user" ? "person" : "guide",
        p_content: turn.content,
      });
      if (error) throw error;
    }
    return { imported: true };
  } catch (error) {
    console.error("Memoria de Sesión: fallo al importar la conversación de invitado ya aceptada:", error);
    return { imported: false };
  }
}

// Borrado explícito de la conversación activa (derecho de la persona,
// mismo estándar que el resto del proyecto desde la Fase 1).
export async function deleteActiveConversation(authHeader: string): Promise<{ deleted: boolean }> {
  try {
    const client = callerClient(authHeader);
    const { error } = await client.rpc("ai_delete_active_conversation");
    if (error) throw error;
    return { deleted: true };
  } catch (error) {
    console.error("Memoria de Sesión: fallo al borrar la conversación activa:", error);
    return { deleted: false };
  }
}
