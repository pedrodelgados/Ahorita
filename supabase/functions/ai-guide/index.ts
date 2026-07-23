// Ahorita — Guía IA
// Edge Function de Supabase: único lugar donde se llama al proveedor de
// inteligencia artificial, para no exponer ninguna clave en el cliente.
//
// Fase 7, Bloque 1 (FASE7_CONTRATO_ARQUITECTONICO.md): reestructurada de un
// flujo monolítico a un pipeline con frontera de datos explícita:
//
//   Identidad resuelta -> Memoria de Sesión -> Contexto permitido ->
//   El Razonador -> Decisión estructurada e inmutable -> La Expresión ->
//   Respuesta final
//
// Fase 7, Bloque 2 (Memoria de Sesión): añade, únicamente para personas
// autenticadas, la única conversación activa por persona (nunca por
// contexto/superficie). Un invitado (sin sesión) sigue exactamente igual
// que en el Bloque 1 -- el cliente sigue siendo la única fuente de verdad
// de su propio hilo, nada se persiste jamás en el servidor para él.
//
// Sin Conocimiento Permanente ni conexión al Motor de Afinidad todavía
// (Bloques 3-4).

import { buildContext } from "./context.ts";
import { decide, type Decision, type MemoryInstruction } from "./decision.ts";
import { express } from "./expression.ts";
import {
  resolveIdentity,
  readConversationalContext,
  persistExchange,
  importGuestTurns,
  deleteActiveConversation,
  fetchExistingConversation,
  type ConversationalContext,
  type ConversationStatusEvent,
} from "./memory.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Comportamiento seguro cuando El Razonador no produce una decisión válida
// (falla el proveedor, o la respuesta no cumple el contrato de decision.ts)
// -- nunca se intenta reconstruir ni adivinar un campo ausente, se usa
// siempre esta misma decisión honesta y fija.
const REASONER_FAILURE_DECISION: Decision = {
  dominantMode: "concierge",
  supportingModes: [],
  content: [],
  narrative: null,
  reason: "No fue posible interpretar la pregunta con la información disponible en este momento.",
  resolutionRoute: "resolver_directo",
  priorityTrace: ["decisión no disponible: comportamiento seguro"],
  actions: [],
  noAnswer: true,
};

const EXPRESSION_FAILURE_REPLY = "No pude responder ahorita. Intenta de nuevo en un momento.";

type GuestTurn = { role: "user" | "assistant"; content: string };

function buildGuestConversationalContext(text: string, guestHistory: GuestTurn[]): ConversationalContext {
  const now = new Date().toISOString();
  const priorTurns = guestHistory.map((m) => ({
    speaker: (m.role === "user" ? "person" : "guide") as "person" | "guide",
    content: m.content,
    // Un invitado no tiene memoria persistida ni marcas de tiempo reales
    // por turno (limitación honesta: GuideChat.jsx no las registra hoy) --
    // se documenta como limitación conocida, nunca se inventa una hora.
    occurredAt: now,
  }));
  return {
    turns: [...priorTurns, { speaker: "person", content: text, occurredAt: now }],
    conversationStartedAt: null,
    now,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const ownerId = await resolveIdentity(authHeader);
    const body = await req.json();
    const action = body.action ?? "ask";

    // Acciones de administración de la Memoria de Sesión -- nunca tocan el
    // pipeline de razonamiento. Ambas exigen identidad real: un invitado no
    // tiene ninguna conversación server-side que borrar o importar.
    if (action === "delete_conversation") {
      if (!ownerId) return jsonResponse({ error: "Se requiere una sesión autenticada." }, 401);
      const { deleted } = await deleteActiveConversation(authHeader!);
      return jsonResponse({ deleted });
    }

    if (action === "import_guest_conversation") {
      if (!ownerId) return jsonResponse({ error: "Se requiere una sesión autenticada." }, 401);
      const turns: GuestTurn[] = Array.isArray(body.guestHistory) ? body.guestHistory : [];
      if (turns.length === 0) return jsonResponse({ error: "No hay turnos para importar." }, 400);
      const { imported } = await importGuestTurns(authHeader!, turns);
      return jsonResponse({ imported });
    }

    // Hidratación al abrir el chat -- lectura pura, nunca invoca a El
    // Razonador ni a La Expresión. Un invitado nunca tiene nada que
    // recuperar (sin persistencia server-side); se responde honestamente
    // en vez de tratarlo como un error.
    if (action === "get_conversation") {
      if (!ownerId) return jsonResponse({ event: null, turns: [] });
      const existing = await fetchExistingConversation(authHeader!);
      return jsonResponse({ event: existing.statusEvent, turns: existing.turns });
    }

    // Camino normal: una pregunta a la Guía IA.
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const placeId: string | null = body.placeId ?? null;
    const guestHistory: GuestTurn[] = Array.isArray(body.guestHistory) ? body.guestHistory : [];

    if (!text) {
      return jsonResponse({ error: "Falta el texto de la pregunta." }, 400);
    }

    // --- Memoria de Sesión (solo personas autenticadas) ---
    let conversationalContext: ConversationalContext;
    let statusEvent: ConversationStatusEvent | null = null;
    let readDegraded = false;

    if (ownerId) {
      const memoryResult = await readConversationalContext(authHeader!, text);
      conversationalContext = memoryResult.conversationalContext;
      statusEvent = memoryResult.statusEvent;
      readDegraded = memoryResult.degraded;
    } else {
      conversationalContext = buildGuestConversationalContext(text, guestHistory);
    }

    // --- Contexto permitido (sin cambios respecto al Bloque 1) ---
    const context = await buildContext(placeId);

    // --- El Razonador ---
    let decision: Decision;
    let memoryInstruction: MemoryInstruction | null = null;
    try {
      const reasonerOutput = await decide(context, conversationalContext);
      if (reasonerOutput) {
        decision = reasonerOutput.decision;
        memoryInstruction = reasonerOutput.memoryInstruction;
      } else {
        decision = REASONER_FAILURE_DECISION;
      }
    } catch (reasonerError) {
      console.error("El Razonador falló:", reasonerError);
      decision = REASONER_FAILURE_DECISION;
    }

    // --- La Expresión ---
    let reply: string;
    try {
      reply = await express(decision);
      if (!reply) throw new Error("La Expresión devolvió una respuesta vacía.");
    } catch (expressionError) {
      console.error("La Expresión falló:", expressionError);
      reply = EXPRESSION_FAILURE_REPLY;
    }

    // --- Persistencia del turno (solo personas autenticadas, solo después
    //     de que la respuesta ya está lista -- nunca antes) ---
    let writeDegraded = false;
    if (ownerId) {
      const { persisted } = await persistExchange(authHeader!, text, reply, memoryInstruction);
      writeDegraded = !persisted;
    }

    // Aditivo y retrocompatible (precisión de compatibilidad del Bloque 1):
    // el frontend actual solo lee `reply`; `actions`/`conversation` viajan
    // preparados para un consumidor visual, sin romper nada existente.
    return jsonResponse({
      reply,
      actions: decision.actions,
      conversation: {
        event: statusEvent,
        memoryDegraded: readDegraded || writeDegraded,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: error.message ?? "Error desconocido" }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
