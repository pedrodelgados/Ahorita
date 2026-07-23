// Ahorita — Guía IA
// Edge Function de Supabase: único lugar donde se llama al proveedor de
// inteligencia artificial, para no exponer ninguna clave en el cliente.
//
// Fase 7, Bloque 1 (FASE7_CONTRATO_ARQUITECTONICO.md): reestructurada de un
// flujo monolítico (un solo prompt que mezclaba contexto, criterio y
// estilo) a un pipeline con frontera de datos explícita:
//
//   Contexto permitido -> El Razonador -> Decisión estructurada e
//   inmutable -> La Expresión -> Respuesta final
//
// Sin Memoria de Sesión, sin Conocimiento Permanente, sin conexión al
// Motor de Afinidad todavía (Bloques 2-4) -- este bloque construye
// únicamente el esqueleto del pipeline, agnóstico de qué tecnología lo
// ejecuta, sobre el mismo contexto de un solo turno que ya existía.

import { buildContext } from "./context.ts";
import { decide, type Decision } from "./decision.ts";
import { express } from "./expression.ts";

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

const EXPRESSION_FAILURE_REPLY =
  "No pude responder ahorita. Intenta de nuevo en un momento.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, placeId } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonResponse({ error: "Falta el arreglo 'messages'." }, 400);
    }

    const context = await buildContext(placeId);

    let decision: Decision;
    try {
      decision = (await decide(context, messages)) ?? REASONER_FAILURE_DECISION;
    } catch (reasonerError) {
      console.error("El Razonador falló:", reasonerError);
      decision = REASONER_FAILURE_DECISION;
    }

    let reply: string;
    try {
      reply = await express(decision);
      if (!reply) throw new Error("La Expresión devolvió una respuesta vacía.");
    } catch (expressionError) {
      console.error("La Expresión falló:", expressionError);
      reply = EXPRESSION_FAILURE_REPLY;
    }

    // Aditivo y retrocompatible (precisión de compatibilidad del Bloque 1):
    // el frontend actual solo lee `reply`; `actions` viaja preparado para
    // un futuro consumidor visual, sin exponerse todavía.
    return jsonResponse({ reply, actions: decision.actions });
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
