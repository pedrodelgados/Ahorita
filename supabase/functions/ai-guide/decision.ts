// Ahorita — Guía IA, Fase 7 Bloque 1: El Razonador.
//
// Responsabilidad única (FASE7_CONTRATO_ARQUITECTONICO.md, componente 3):
// sintetizar el contexto real y la conversación en una decisión de qué
// responder y por qué. Consulta, nunca reconstruye, ninguna fuente de
// verdad ya existente. No tiene memoria propia -- todo lo que "sabe" en
// este bloque proviene del contexto de un solo turno (context.ts), sin
// Memoria de Sesión, Conocimiento Permanente ni Motor de Afinidad todavía
// (Bloques 2-4).
//
// La tecnología que ejecuta esta síntesis (hoy, Claude vía la Edge
// Function ya construida desde la Fase 1) es deliberadamente reemplazable
// -- lo permanente es el contrato de esta decisión (abajo) y las reglas
// que la gobiernan, nunca el mecanismo concreto que la produce.

import Anthropic from "npm:@anthropic-ai/sdk@0.71.0";
import type { GuideContext } from "./context.ts";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

export const MODES = ["concierge", "planificador", "narrador", "descubridor"] as const;
export type Mode = (typeof MODES)[number];

export const RESOLUTION_ROUTES = ["resolver_directo", "delegar_busqueda", "combinar"] as const;
export type ResolutionRoute = (typeof RESOLUTION_ROUTES)[number];

export const ACTION_TYPES = ["abrir_ficha", "iniciar_navegacion", "guardar", "compartir"] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const TARGET_TYPES = ["event", "publicacion", "place", "general"] as const;
export type TargetType = (typeof TARGET_TYPES)[number];

export type ContentItem = {
  targetType: TargetType;
  targetId: string | null;
  title: string;
  detail: string;
};

// Acciones derivadas (precisión del Product Owner antes de aprobar el
// diseño técnico): forman parte de la decisión, pero nunca son su
// propósito -- siempre consecuencia, nunca el centro del razonamiento.
export type DerivedAction = {
  type: ActionType;
  targetType: TargetType;
  targetId: string;
  label: string;
};

// La forma completa de "una decisión" (diseño técnico del Bloque 1,
// revisión final). Cada campo existe porque un punto concreto del diseño
// o de la revisión lo exigió explícitamente -- ninguno es incidental.
export type Decision = {
  dominantMode: Mode;
  supportingModes: Mode[];
  content: ContentItem[];
  narrative: string | null;
  reason: string;
  resolutionRoute: ResolutionRoute;
  // Explicación SUFICIENTE para justificar la respuesta de forma honesta y
  // comprensible -- nunca una reconstrucción exhaustiva del proceso interno
  // (precisión de la revisión final del diseño técnico).
  priorityTrace: string[];
  actions: DerivedAction[];
  noAnswer: boolean;
};

function isMode(value: unknown): value is Mode {
  return typeof value === "string" && (MODES as readonly string[]).includes(value);
}

function isResolutionRoute(value: unknown): value is ResolutionRoute {
  return typeof value === "string" && (RESOLUTION_ROUTES as readonly string[]).includes(value);
}

function isTargetType(value: unknown): value is TargetType {
  return typeof value === "string" && (TARGET_TYPES as readonly string[]).includes(value);
}

function isActionType(value: unknown): value is ActionType {
  return typeof value === "string" && (ACTION_TYPES as readonly string[]).includes(value);
}

function isContentItem(value: unknown): value is ContentItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    isTargetType(v.targetType) &&
    (v.targetId === null || typeof v.targetId === "string") &&
    typeof v.title === "string" &&
    v.title.length > 0 &&
    typeof v.detail === "string"
  );
}

function isDerivedAction(value: unknown): value is DerivedAction {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    isActionType(v.type) &&
    isTargetType(v.targetType) &&
    typeof v.targetId === "string" &&
    v.targetId.length > 0 &&
    typeof v.label === "string" &&
    v.label.length > 0
  );
}

// Contrato validable (precisión de la revisión final): si la decisión
// producida no cumple exactamente esta forma, nunca se intenta adivinar o
// completar el campo ausente -- se rechaza por completo y el llamador debe
// usar un comportamiento seguro (ver DECISION_SAFE_FALLBACK en index.ts).
export function validateDecision(value: unknown): Decision | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;

  if (!isMode(v.dominantMode)) return null;
  if (!Array.isArray(v.supportingModes) || !v.supportingModes.every(isMode)) return null;
  if (v.supportingModes.includes(v.dominantMode)) return null; // el dominante nunca se duplica como apoyo
  if (!Array.isArray(v.content) || !v.content.every(isContentItem)) return null;
  if (v.narrative !== null && typeof v.narrative !== "string") return null;
  if (typeof v.reason !== "string" || v.reason.length === 0) return null;
  if (!isResolutionRoute(v.resolutionRoute)) return null;
  if (!Array.isArray(v.priorityTrace) || !v.priorityTrace.every((t) => typeof t === "string")) return null;
  if (!Array.isArray(v.actions) || !v.actions.every(isDerivedAction)) return null;
  if (typeof v.noAnswer !== "boolean") return null;

  // Una decisión honesta de "no sé" nunca debería venir acompañada de
  // contenido ni acciones -- inconsistencia que el propio Razonador no
  // debería producir nunca, pero que el validador debe rechazar si ocurre.
  if (v.noAnswer && (v.content.length > 0 || v.actions.length > 0)) return null;

  return {
    dominantMode: v.dominantMode,
    supportingModes: v.supportingModes,
    content: v.content,
    narrative: v.narrative,
    reason: v.reason,
    resolutionRoute: v.resolutionRoute,
    priorityTrace: v.priorityTrace,
    actions: v.actions,
    noAnswer: v.noAnswer,
  };
}

function buildReasonerSystemPrompt(context: GuideContext): string {
  // Reglas traducidas directamente de AI_PHILOSOPHY.md (principios no
  // negociables 1-11, §9 jerarquía de priorización) y de
  // FASE7_CONTRATO_ARQUITECTONICO.md / FASE7_FILOSOFIA_GUIA_IA.md -- este
  // prompt no inventa ningún criterio de comportamiento nuevo, solo lo
  // aterriza en un contrato de salida verificable.
  const rules = `Eres El Razonador de la Guía IA de Ahorita (Cuenca, Ecuador). Tu única responsabilidad es decidir QUÉ responder y POR QUÉ -- nunca cómo se dice, eso lo hace un componente separado.

Debes responder EXCLUSIVAMENTE con un objeto JSON, sin texto adicional antes ni después, con esta forma exacta:
{
  "dominantMode": "concierge" | "planificador" | "narrador" | "descubridor",
  "supportingModes": [ ...cero o más de los mismos cuatro, nunca repitiendo el dominante... ],
  "content": [ { "targetType": "event"|"publicacion"|"place"|"general", "targetId": string|null, "title": string, "detail": string }, ... ],
  "narrative": string | null,
  "reason": string,
  "resolutionRoute": "resolver_directo" | "delegar_busqueda" | "combinar",
  "priorityTrace": [ ...strings breves, ej. "restricción de horario aplicada", "sin contenido patrocinado en juego"... ],
  "actions": [ { "type": "abrir_ficha"|"iniciar_navegacion"|"guardar"|"compartir", "targetType": "event"|"publicacion"|"place", "targetId": string, "label": string }, ... ],
  "noAnswer": boolean
}

Reglas no negociables (nunca las rompas):
- Nunca inventes un lugar, evento, precio, horario o dato que no exista en el contexto real que se te da abajo.
- Si no tienes información suficiente, responde con "noAnswer": true, "content": [], "actions": [], y una "reason" honesta -- nunca fuerces una respuesta mediocre.
- Jerarquía de prioridad, siempre en este orden: (1) restricciones duras del momento (horario, presupuesto, tiempo declarado) nunca se ignoran; (2) seguridad y bienestar de la persona; (3) relevancia real del contenido; (4) confianza/verificación como desempate; (5) contenido editorial, nunca por encima de lo anterior. Refleja qué niveles aplicaste en "priorityTrace", de forma breve, nunca exhaustiva.
- El modo "descubridor" (proponer algo no pedido) solo puede ser dominante o de apoyo si se cumplen TODAS estas condiciones a la vez: (1) hay contenido real, verificado y vigente que la persona no pidió; (2) no compite por la posición de la respuesta principal, se agrega después; (3) tiene una razón de pertinencia genuina, nunca "porque está disponible"; (4) ninguna restricción dura ni señal de seguridad está en juego en este turno; (5) existe un espacio conversacional natural para introducirlo sin romper el propósito del turno. Si falta una sola, no actives "descubridor".
- Siempre existe exactamente un "dominantMode". Los "supportingModes" solo añaden, nunca redefinen la estructura de la decisión.
- Si la intención de la persona es una búsqueda directa por nombre exacto, usa "resolutionRoute": "delegar_busqueda". Si necesita síntesis real, "resolver_directo". Si necesita ambas, "combinar".
- Las acciones derivadas ("actions") son siempre consecuencia de la decisión, nunca su propósito -- nunca inventes una acción que el contenido no sustente.
- Nunca dejes que contenido patrocinado o editorial desplace algo más relevante o más seguro.`;

  const contextBlock =
    context.type === "place"
      ? `Contexto real disponible (ficha de "${context.place?.name ?? "lugar"}"): ${JSON.stringify(context)}`
      : `Contexto real disponible (vista general de la ciudad): ${JSON.stringify(context)}`;

  return `${rules}\n\n${contextBlock}`;
}

// Produce la decisión o null si la respuesta del modelo no cumplió el
// contrato -- nunca intenta reparar ni completar una decisión incompleta.
export async function decide(
  context: GuideContext,
  messages: Array<{ role: string; content: string }>
): Promise<Decision | null> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1000,
    thinking: { type: "disabled" },
    system: buildReasonerSystemPrompt(context),
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock?.type === "text" ? textBlock.text : "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  return validateDecision(parsed);
}
