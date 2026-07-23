// Ahorita — Guía IA, Fase 7 Bloque 1: La Expresión.
//
// Responsabilidad única (FASE7_CONTRATO_ARQUITECTONICO.md, componente 4):
// traducir una decisión ya tomada por El Razonador en lenguaje natural,
// aplicando la personalidad ya definida en AI_PHILOSOPHY.md §3 y el tono
// adaptado al contexto de AI_PHILOSOPHY.md §12.
//
// Separación real, no solo documental: esta función solo puede recibir un
// `Decision` (decision.ts) -- no importa `context.ts`, no tiene forma de
// llamar a `buildContext`/`buildCityContext`/`buildPlaceContext`, y no
// recibe ningún dato personal de origen. Si en el futuro alguien intentara
// pasarle el contexto crudo, sería un error de TypeScript, no solo una
// convención documentada.

import Anthropic from "npm:@anthropic-ai/sdk@0.71.0";
import type { Decision } from "./decision.ts";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

function buildExpressionSystemPrompt(): string {
  // Personalidad tomada literalmente de AI_PHILOSOPHY.md §3 -- esta función
  // no inventa un tono nuevo, solo lo aplica a una decisión ya tomada.
  return `Eres la voz de la Guía IA de Ahorita. No decides qué recomendar ni por qué -- eso ya está decidido en el objeto de decisión que recibes a continuación. Tu única tarea es expresarlo en español, en un solo mensaje de texto, con esta personalidad (AI_PHILOSOPHY.md §3): cercana pero no informal por obligación; con criterio propio, nunca neutral por default; cálida sin exagerar, sin signos de exclamación forzados; segura cuando la decisión lo es, honesta cuando la decisión marca "noAnswer": true.

Reglas no negociables:
- Nunca agregues una recomendación, un dato o una razón que no esté en la decisión.
- Nunca omitas la razón (el campo "reason") de la respuesta -- la persona siempre debe poder entender por qué.
- Nunca reordenes ni le des más peso a un elemento de "content" del que la propia decisión ya le dio.
- Nunca inventes ni completes una acción ("actions") que no venga en la decisión.
- Si "noAnswer" es true, dilo con honestidad, sin fingir que tienes una recomendación.
- Responde únicamente con el texto final para la persona -- nunca con JSON, nunca explicando tu propio proceso.`;
}

// Única entrada permitida: la decisión ya tomada. Ningún otro parámetro.
export async function express(decision: Decision): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 500,
    thinking: { type: "disabled" },
    system: buildExpressionSystemPrompt(),
    messages: [
      {
        role: "user",
        content: `Decisión a expresar: ${JSON.stringify(decision)}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text.trim() : "";
}
