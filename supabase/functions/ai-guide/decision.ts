// Ahorita — Guía IA, Fase 7 Bloque 1 + Bloque 2 + Bloque 3: El Razonador.
//
// Responsabilidad única (FASE7_CONTRATO_ARQUITECTONICO.md, componente 3):
// sintetizar el contexto real, el contexto conversacional vigente y los
// hechos de Conocimiento Permanente ya confirmados en una decisión de qué
// responder y por qué. Consulta, nunca reconstruye, ninguna fuente de
// verdad ya existente. No tiene memoria propia -- todo lo que "sabe"
// proviene del contexto permitido (context.ts), la Memoria de Sesión
// (memory.ts) y el Conocimiento Permanente (permanentKnowledge.ts), sin
// Motor de Afinidad todavía (Bloque 4).
//
// Agnosticismo reforzado en el Bloque 2 (ajuste explícito del Product
// Owner antes de aprobar la implementación): este archivo nunca habla de
// "mensajes" -- consume exclusivamente un `ConversationalContext`, el único
// contrato que produce memory.ts. Nunca sabe si por debajo la
// representación es mensajes literales, contexto estructurado o una
// síntesis -- esa elección pertenece exclusivamente a la Memoria de
// Sesión y puede cambiar sin que este archivo se entere. La traducción de
// ese contexto genérico al formato de mensajes que un proveedor concreto
// necesita (hoy, Claude) es un detalle interno de este archivo, nunca
// parte de su contrato de entrada.
//
// Bloque 3 (precisión explícita del Product Owner antes de aprobar la
// implementación): El Razonador PROPONE un candidato de Conocimiento
// Permanente -- nunca lo crea, nunca lo guarda, nunca lo llama "hecho".
// Solo una acción explícita de interfaz, posterior y separada de esta
// síntesis, puede convertir un candidato en un hecho permanente.
//
// La tecnología que ejecuta esta síntesis (hoy, Claude vía la Edge
// Function ya construida desde la Fase 1) es deliberadamente reemplazable
// -- lo permanente es el contrato de esta decisión (abajo) y las reglas
// que la gobiernan, nunca el mecanismo concreto que la produce.

import Anthropic from "npm:@anthropic-ai/sdk@0.71.0";
import type { GuideContext } from "./context.ts";
import type { ConversationalContext } from "./memory.ts";
import type { PermanentFact } from "./permanentKnowledge.ts";

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

// Retractación explícita ("olvida lo anterior", "no dije eso") -- Bloque 2.
// Reconocer que la persona pidió esto es interpretación de lenguaje,
// responsabilidad exclusiva de El Razonador; la Memoria de Sesión solo
// ejecuta, de forma mecánica, el alcance ya decidido aquí (ver
// ai_append_exchange en la migración). Nunca se usa para una corrección
// normal ("somos cuatro, no dos") -- eso ya prevalece por sí solo al leer
// el hilo completo, sin necesitar ninguna instrucción especial.
export const RETRACTION_SCOPES = ["ultimo_turno_persona", "todo_lo_anterior"] as const;
export type RetractionScope = (typeof RETRACTION_SCOPES)[number];

export type MemoryInstruction = {
  action: "retract";
  scope: RetractionScope;
};

function isRetractionScope(value: unknown): value is RetractionScope {
  return typeof value === "string" && (RETRACTION_SCOPES as readonly string[]).includes(value);
}

// Contrato validable, mismo criterio que validateDecision: nunca se intenta
// adivinar o completar un valor ausente/incorrecto -- se rechaza (null),
// que index.ts trata como "ninguna retractación en este turno".
export function validateMemoryInstruction(value: unknown): MemoryInstruction | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.action !== "retract") return null;
  if (!isRetractionScope(v.scope)) return null;
  return { action: "retract", scope: v.scope };
}

function describeConversationalContext(conversationalContext: ConversationalContext): string {
  if (!conversationalContext.conversationStartedAt) {
    return "Esta es la primera vez que la persona escribe en esta conversación -- no hay contexto conversacional previo.";
  }
  const startedMs = new Date(conversationalContext.conversationStartedAt).getTime();
  const nowMs = new Date(conversationalContext.now).getTime();
  const elapsedMinutes = Math.max(0, Math.round((nowMs - startedMs) / 60000));
  return `Esta conversación comenzó hace aproximadamente ${elapsedMinutes} minuto(s). Usa este dato para juzgar si algo dicho al principio (una restricción de tiempo, de lugar, de compañía) puede haber perdido vigencia -- la Memoria de Sesión solo retiene lo dicho, nunca decide por sí sola qué sigue aplicando.`;
}

// Candidato de Conocimiento Permanente (Bloque 3) -- catálogo cerrado y
// estable, sincronizado por convención con
// 0044_fase7_bloque3_conocimiento_permanente.sql (una categoría nunca
// cambia de significado una vez creada; un cambio conceptual futuro exige
// una categoría nueva vía migración, nunca reinterpretar una existente).
export const PERMANENT_KNOWLEDGE_CATEGORIES = [
  "idioma_preferido",
  "preferencia_estilo_respuesta",
  "restriccion_alimentaria",
  "necesidad_movilidad",
  "necesidad_accesibilidad",
  "dato_financiero_declarado",
] as const;
export type PermanentKnowledgeCategory = (typeof PERMANENT_KNOWLEDGE_CATEGORIES)[number];

// El Razonador PROPONE un candidato -- nunca un hecho. Solo se convierte en
// un hecho permanente tras una acción explícita de interfaz, separada de
// esta síntesis (ver permanentKnowledge.ts). Esta salida nunca escribe nada
// por sí misma.
export type PermanentKnowledgeCandidate = {
  category: PermanentKnowledgeCategory;
  subtype: string;
  suggestedValue: string;
  reason: string;
};

function isPermanentKnowledgeCategory(value: unknown): value is PermanentKnowledgeCategory {
  return typeof value === "string" && (PERMANENT_KNOWLEDGE_CATEGORIES as readonly string[]).includes(value);
}

// Mismo criterio que validateMemoryInstruction: nunca se intenta adivinar o
// completar un candidato malformado -- se descarta (null), equivalente a
// "sin candidato en este turno".
export function validatePermanentKnowledgeCandidate(value: unknown): PermanentKnowledgeCandidate | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!isPermanentKnowledgeCategory(v.category)) return null;
  if (typeof v.subtype !== "string" || v.subtype.length === 0) return null;
  if (typeof v.suggestedValue !== "string" || v.suggestedValue.length === 0) return null;
  if (typeof v.reason !== "string" || v.reason.length === 0) return null;
  return { category: v.category, subtype: v.subtype, suggestedValue: v.suggestedValue, reason: v.reason };
}

function describePermanentFacts(facts: PermanentFact[]): string {
  if (facts.length === 0) {
    return "No existe todavía ningún Conocimiento Permanente confirmado sobre esta persona.";
  }
  const lines = facts.map(
    (f) =>
      `- ${f.category}${f.subtype !== "general" ? ` (${f.subtype})` : ""}: "${f.value}" -- confirmado el ${f.confirmedAt}, sensibilidad ${f.sensitivityLevel}${f.reconfirmationRelevant ? ", puede haber cambiado con el tiempo" : ""}.`
  );
  return `Conocimiento Permanente ya confirmado sobre esta persona (hechos vigentes, nunca afinidad, nunca contexto temporal):\n${lines.join("\n")}`;
}

function buildReasonerSystemPrompt(
  context: GuideContext,
  conversationalContext: ConversationalContext,
  permanentFacts: PermanentFact[]
): string {
  // Reglas traducidas directamente de AI_PHILOSOPHY.md (principios no
  // negociables 1-11, §9 jerarquía de priorización) y de
  // FASE7_CONTRATO_ARQUITECTONICO.md / FASE7_FILOSOFIA_GUIA_IA.md -- este
  // prompt no inventa ningún criterio de comportamiento nuevo, solo lo
  // aterriza en un contrato de salida verificable.
  const rules = `Eres El Razonador de la Guía IA de Ahorita (Cuenca, Ecuador). Tu única responsabilidad es decidir QUÉ responder y POR QUÉ -- nunca cómo se dice, eso lo hace un componente separado.

Debes responder EXCLUSIVAMENTE con un objeto JSON, sin texto adicional antes ni después, con esta forma exacta:
{
  "decision": {
    "dominantMode": "concierge" | "planificador" | "narrador" | "descubridor",
    "supportingModes": [ ...cero o más de los mismos cuatro, nunca repitiendo el dominante... ],
    "content": [ { "targetType": "event"|"publicacion"|"place"|"general", "targetId": string|null, "title": string, "detail": string }, ... ],
    "narrative": string | null,
    "reason": string,
    "resolutionRoute": "resolver_directo" | "delegar_busqueda" | "combinar",
    "priorityTrace": [ ...strings breves, ej. "restricción de horario aplicada", "sin contenido patrocinado en juego"... ],
    "actions": [ { "type": "abrir_ficha"|"iniciar_navegacion"|"guardar"|"compartir", "targetType": "event"|"publicacion"|"place", "targetId": string, "label": string }, ... ],
    "noAnswer": boolean
  },
  "memoryInstruction": null | { "action": "retract", "scope": "ultimo_turno_persona" | "todo_lo_anterior" },
  "permanentKnowledgeCandidate": null | { "category": "idioma_preferido"|"preferencia_estilo_respuesta"|"restriccion_alimentaria"|"necesidad_movilidad"|"necesidad_accesibilidad"|"dato_financiero_declarado", "subtype": string, "suggestedValue": string, "reason": string }
}

Reglas no negociables sobre "decision" (nunca las rompas):
- Nunca inventes un lugar, evento, precio, horario o dato que no exista en el contexto real que se te da abajo.
- Si no tienes información suficiente, responde con "noAnswer": true, "content": [], "actions": [], y una "reason" honesta -- nunca fuerces una respuesta mediocre.
- Jerarquía de prioridad, siempre en este orden: (1) restricciones duras del momento (horario, presupuesto, tiempo declarado) nunca se ignoran; (2) seguridad y bienestar de la persona; (3) relevancia real del contenido; (4) confianza/verificación como desempate; (5) contenido editorial, nunca por encima de lo anterior. Refleja qué niveles aplicaste en "priorityTrace", de forma breve, nunca exhaustiva.
- El modo "descubridor" (proponer algo no pedido) solo puede ser dominante o de apoyo si se cumplen TODAS estas condiciones a la vez: (1) hay contenido real, verificado y vigente que la persona no pidió; (2) no compite por la posición de la respuesta principal, se agrega después; (3) tiene una razón de pertinencia genuina, nunca "porque está disponible"; (4) ninguna restricción dura ni señal de seguridad está en juego en este turno; (5) existe un espacio conversacional natural para introducirlo sin romper el propósito del turno. Si falta una sola, no actives "descubridor".
- Siempre existe exactamente un "dominantMode". Los "supportingModes" solo añaden, nunca redefinen la estructura de la decisión.
- Si la intención de la persona es una búsqueda directa por nombre exacto, usa "resolutionRoute": "delegar_busqueda". Si necesita síntesis real, "resolver_directo". Si necesita ambas, "combinar".
- Las acciones derivadas ("actions") son siempre consecuencia de la decisión, nunca su propósito -- nunca inventes una acción que el contenido no sustente.
- Nunca dejes que contenido patrocinado o editorial desplace algo más relevante o más seguro.

Reglas no negociables sobre "memoryInstruction" (Memoria de Sesión, Bloque 2):
- Si la persona pide explícitamente olvidar algo dicho antes en esta conversación ("olvida lo anterior", "no dije eso", "borra eso"), responde con "memoryInstruction": { "action": "retract", "scope": "..." }. Usa "ultimo_turno_persona" si se refiere solo a lo último que dijo; usa "todo_lo_anterior" si pide olvidar todo el hilo hasta ahora. Nunca discutas ni intentes demostrar que el registro anterior era correcto -- acepta la corrección de inmediato, sin objetar.
- Una corrección normal ("somos cuatro, no dos", "cambié de plan") NUNCA activa "memoryInstruction" -- no es una retractación, es un dato nuevo que ya prevalece por sí solo al leer el hilo completo en orden. "memoryInstruction" debe ser "null" en cualquier otro caso.
- Si no hay contexto conversacional previo (primera vez que la persona escribe), "memoryInstruction" siempre debe ser "null".

Reglas no negociables sobre "permanentKnowledgeCandidate" (Conocimiento Permanente no-afinidad, Bloque 3):
- TÚ NUNCA GUARDAS NI CREAS UN HECHO. Como mucho, propones un CANDIDATO pendiente de que la persona lo confirme en un paso de interfaz separado -- "permanentKnowledgeCandidate" nunca es, por sí mismo, un dato ya guardado.
- Solo puedes proponer una categoría que ya exista en la lista cerrada de arriba -- nunca inventes una categoría nueva ni reinterpretes el significado de una existente.
- Para categorías de sensibilidad baja o media ("idioma_preferido", "preferencia_estilo_respuesta", "restriccion_alimentaria", "necesidad_movilidad"), solo propones un candidato si se cumplen TODAS estas condiciones: (1) el dato ya fue expresado explícitamente por la persona, nunca inferido; (2) tiene una utilidad clara y concreta entre conversaciones futuras; (3) existe un momento conversacional natural para mencionarlo, nunca forzado; (4) la conversación no es urgente ni sensible en este turno; (5) la sugerencia no puede interrumpir ni desplazar la respuesta principal; (6) no se rechazó ya una sugerencia equivalente en esta misma conversación; (7) no la repites si ya la propusiste antes en este mismo hilo; (8) la finalidad puede explicarse de forma simple. Si falta una sola, "permanentKnowledgeCandidate" debe ser "null".
- Para categorías reforzadas ("necesidad_accesibilidad", "dato_financiero_declarado"), un criterio todavía más estricto: NUNCA propongas espontáneamente solo porque el dato sería útil. Solo puedes proponer un candidato si la propia persona ya expresó, en sus palabras, que quiere que esto se recuerde en el futuro, o preguntó explícitamente cómo evitar repetirlo.
- Nunca propongas una categoría o un valor que ya coincide exactamente con un hecho ya confirmado (ver el Conocimiento Permanente ya existente abajo) -- si ya está guardado con el mismo valor, no hay nada que proponer.
- "permanentKnowledgeCandidate" debe ser "null" en cualquier otro caso, incluida cualquier duda razonable.`;

  const contextBlock =
    context.type === "place"
      ? `Contexto real disponible (ficha de "${context.place?.name ?? "lugar"}"): ${JSON.stringify(context)}`
      : `Contexto real disponible (vista general de la ciudad): ${JSON.stringify(context)}`;

  const conversationalBlock = describeConversationalContext(conversationalContext);
  const permanentFactsBlock = describePermanentFacts(permanentFacts);

  return `${rules}\n\n${contextBlock}\n\n${conversationalBlock}\n\n${permanentFactsBlock}`;
}

// Traducción interna, privada de este archivo: el "contexto conversacional
// vigente" (genérico, sin proveedor) se convierte aquí en el formato de
// mensajes que el proveedor actual (Claude) necesita para su propia API --
// ni memory.ts ni el contrato de entrada de este módulo saben que esta
// traducción existe.
function toProviderMessages(conversationalContext: ConversationalContext): Array<{ role: string; content: string }> {
  return conversationalContext.turns.map((turn) => ({
    role: turn.speaker === "person" ? "user" : "assistant",
    content: turn.content,
  }));
}

export type ReasonerOutput = {
  decision: Decision;
  memoryInstruction: MemoryInstruction | null;
  permanentKnowledgeCandidate: PermanentKnowledgeCandidate | null;
};

// Produce la decisión (+ una eventual instrucción de memoria y/o un
// candidato de Conocimiento Permanente) o null si la respuesta del modelo
// no cumplió el contrato -- nunca intenta reparar ni completar una decisión
// incompleta.
export async function decide(
  context: GuideContext,
  conversationalContext: ConversationalContext,
  permanentFacts: PermanentFact[]
): Promise<ReasonerOutput | null> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1000,
    thinking: { type: "disabled" },
    system: buildReasonerSystemPrompt(context, conversationalContext, permanentFacts),
    messages: toProviderMessages(conversationalContext),
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock?.type === "text" ? textBlock.text : "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;

  const envelope = parsed as Record<string, unknown>;
  const decision = validateDecision(envelope.decision);
  if (!decision) return null;

  // Un "memoryInstruction" o un "permanentKnowledgeCandidate" inválidos
  // nunca invalidan una decisión por lo demás correcta -- simplemente se
  // descartan (equivalente a "null"), la misma disciplina de "no adivinar,
  // no reparar" aplicada aquí a campos secundarios en vez de al contrato
  // completo.
  const memoryInstruction = validateMemoryInstruction(envelope.memoryInstruction);
  const permanentKnowledgeCandidate = validatePermanentKnowledgeCandidate(envelope.permanentKnowledgeCandidate);

  return { decision, memoryInstruction, permanentKnowledgeCandidate };
}
