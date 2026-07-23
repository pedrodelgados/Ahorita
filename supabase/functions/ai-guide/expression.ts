// Ahorita — Guía IA, Fase 7 Bloque 1 + Bloque 3: La Expresión.
//
// Responsabilidad única (FASE7_CONTRATO_ARQUITECTONICO.md, componente 4):
// traducir una decisión ya tomada por El Razonador en lenguaje natural,
// aplicando la personalidad ya definida en AI_PHILOSOPHY.md §3 y el tono
// adaptado al contexto de AI_PHILOSOPHY.md §12.
//
// Separación real, no solo documental: esta función solo puede recibir el
// `Decision` (decision.ts) y, desde el Bloque 3, el `PermanentKnowledgeCandidate`
// que El Razonador ya decidió proponer -- nunca `context.ts`, nunca los
// hechos ya guardados (`permanentKnowledge.ts`), nunca ningún dato personal
// de origen. Si en el futuro alguien intentara pasarle el contexto crudo o
// los hechos vigentes, sería un error de TypeScript, no solo una convención
// documentada.
//
// Corrección aplicada tras la auditoría final del Bloque 3 (hallazgo 2): el
// candidato viajaba antes directamente hasta la interfaz con su campo
// "reason" -- texto crudo de El Razonador -- rompiendo para esa superficie
// el mismo principio permanente que sí se respetaba para la respuesta
// principal ("El Razonador nunca habla directamente con la persona"). Ahora
// El Razonador solo decide SI corresponde proponer un candidato (criterio ya
// aprobado); cómo se le comunica a la persona es, como el resto, decisión
// exclusiva de La Expresión.
import Anthropic from "npm:@anthropic-ai/sdk@0.71.0";
import type { Decision, PermanentKnowledgeCandidate } from "./decision.ts";

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
- Responde únicamente con el texto final para la persona -- nunca con JSON, nunca explicando tu propio proceso.

Reglas no negociables sobre el candidato de Conocimiento Permanente (si se te entrega uno):
- Si recibes un candidato, siempre lo mencionas -- en una frase breve, aparte, después de responder por completo la pregunta principal, nunca antes ni desplazándola. El Razonador ya decidió que corresponde proponerlo; tu única tarea es decidir CÓMO decirlo, nunca SI decirlo.
- Redacta esa mención con tus propias palabras, tomando como base el "reason" y el "suggestedValue" del candidato -- nunca los copies literalmente, nunca los presentes como una cita.
- Exprésalo siempre como una invitación abierta a confirmar, nunca como algo que ya guardaste o que vas a recordar automáticamente -- la persona todavía tiene que confirmarlo aparte, en la interfaz.
- Si no recibes ningún candidato, no menciones nada sobre recordar o guardar información sobre la persona -- ni lo sugieras por tu cuenta.`;
}

// Única entrada permitida: la decisión ya tomada, y opcionalmente el
// candidato de Conocimiento Permanente que El Razonador ya decidió proponer
// en este turno (nunca ningún otro dato).
export async function express(
  decision: Decision,
  permanentKnowledgeCandidate: PermanentKnowledgeCandidate | null = null
): Promise<string> {
  const candidateBlock = permanentKnowledgeCandidate
    ? `\n\nCandidato de Conocimiento Permanente propuesto por El Razonador en este turno (menciónalo siempre, con tus propias palabras, como se indica arriba): ${JSON.stringify(permanentKnowledgeCandidate)}`
    : "";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 500,
    thinking: { type: "disabled" },
    system: buildExpressionSystemPrompt(),
    messages: [
      {
        role: "user",
        content: `Decisión a expresar: ${JSON.stringify(decision)}${candidateBlock}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text.trim() : "";
}
