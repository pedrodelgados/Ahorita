// Ahorita — Guía IA
// Edge Function de Supabase: único lugar donde se llama a la API de Claude,
// para no exponer ANTHROPIC_API_KEY en el cliente. Arma el contexto de la
// pregunta a partir de datos reales de la base (preguntas, respuestas,
// estados, lugares) antes de preguntarle al modelo.

import Anthropic from "npm:@anthropic-ai/sdk@0.71.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, placeId } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonResponse({ error: "Falta el arreglo 'messages'." }, 400);
    }

    const context = placeId
      ? await buildPlaceContext(placeId)
      : await buildCityContext();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 700,
      thinking: { type: "disabled" },
      system: buildSystemPrompt(context),
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock?.type === "text" ? textBlock.text : "";

    return jsonResponse({ reply });
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

type PlaceContext = {
  type: "place";
  place: Record<string, unknown> | null;
  questions: Array<{ text: string; answers: Array<{ text: string; verified: boolean }> }>;
  statuses: Array<{ text: string }>;
  nearby: Array<{ name: string; area: string; channel_default: string }>;
};

type CityContext = {
  type: "city";
  places: Array<{ name: string; area: string; channel_default: string }>;
  editorial: { title: string; items: string[] } | null;
};

async function buildPlaceContext(placeId: string): Promise<PlaceContext> {
  const [placeRes, questionsRes, statusesRes, nearbyRes] = await Promise.all([
    supabase.from("places").select("*").eq("id", placeId).single(),
    supabase
      .from("questions")
      .select("text, created_at, answers(text, verified)")
      .eq("place_id", placeId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("statuses")
      .select("text, created_at")
      .eq("place_id", placeId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("places").select("name, area, channel_default").neq("id", placeId).limit(30),
  ]);

  const place = placeRes.data;
  const nearby = (nearbyRes.data ?? []).filter((p) => p.area === place?.area).slice(0, 8);

  return { type: "place" as const, place, questions: questionsRes.data ?? [], statuses: statusesRes.data ?? [], nearby };
}

async function buildCityContext(): Promise<CityContext> {
  const [placesRes, editorialRes] = await Promise.all([
    supabase.from("places").select("name, area, channel_default").limit(40),
    supabase
      .from("editorial_posts")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return { type: "city" as const, places: placesRes.data ?? [], editorial: editorialRes.data };
}

function buildSystemPrompt(context: PlaceContext | CityContext) {
  const base = `Eres la Guía IA de Ahorita, una app para descubrir en tiempo real lo que pasa en Cuenca, Ecuador. Responde siempre en español, de forma breve y cálida, como alguien que conoce bien la ciudad. Usa solo la información del contexto que se te da — si no tienes datos suficientes para responder algo, dilo con honestidad en vez de inventar.`;

  if (context.type === "place") {
    const { place, questions, statuses, nearby } = context;
    const qa = questions
      .map((q) => {
        const answers = (q.answers ?? [])
          .map((a) => `  - ${a.text}${a.verified ? " (verificada)" : ""}`)
          .join("\n");
        return `- Pregunta: ${q.text}\n${answers}`;
      })
      .join("\n");
    const liveReports = statuses.map((s) => `- ${s.text}`).join("\n");
    const nearbyList = nearby.map((p) => `${p.name} (${p.channel_default})`).join(", ");

    return `${base}

El usuario está viendo la ficha de "${place?.name}" (zona: ${place?.area}, categoría: ${place?.channel_default}).

Preguntas y respuestas recientes de la comunidad sobre este lugar:
${qa || "(sin preguntas todavía)"}

Reportes en vivo recientes:
${liveReports || "(sin reportes recientes)"}

Otros lugares en la misma zona que puedes sugerir si encajan con la pregunta del usuario:
${nearbyList || "(no hay otros lugares registrados en esta zona todavía)"}

Si te piden una ruta o recorrido, sugiere un orden razonable entre estos lugares y aclara que es una sugerencia aproximada, no calculada con un mapa real.`;
  }

  const { places, editorial } = context;
  const placesList = places.map((p) => `${p.name} (${p.area}, ${p.channel_default})`).join(", ");

  return `${base}

Contenido curado destacado${editorial ? `: "${editorial.title}" — ${(editorial.items ?? []).join("; ")}` : " (no hay ninguno publicado todavía)"}.

Lugares disponibles en la app: ${placesList || "(todavía no hay lugares cargados)"}.

Si el usuario pide un plan o ruta, recomienda lugares de esta lista según lo que pida (zona, categoría, tipo de plan).`;
}
