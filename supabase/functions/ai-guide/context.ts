// Ahorita — Guía IA, Fase 7 Bloque 1: capa de contexto.
//
// Responsabilidad única: reunir el contexto real del ecosistema que El
// Razonador podrá consultar. No interpreta, no decide, no tiene ningún
// conocimiento de cómo se va a usar lo que reúne -- exactamente el mismo
// tipo de frontera que ya separa, en la Fase 6, "candidatos" de
// "composición" (ver FASE6_CONTRATO_ARQUITECTONICO.md).
//
// Corrección de un defecto real encontrado durante la auditoría previa a
// este bloque: la versión anterior de este archivo (dentro de index.ts)
// consultaba `editorial_posts`, una tabla eliminada desde la migración
// `0010_events.sql` ("Inicio solo eventos") -- cualquier pregunta a la Guía
// IA sin `placeId` (el camino usado desde Inicio y Explorar) fallaba con un
// error de "relation does not exist". Se reemplaza aquí por la única
// superficie oficial de lectura editorial de la Fase 6: la función pública
// `candidatos_editorial()` (RPC ya usada por `src/lib/editorial.js`) --
// nunca una interpretación nueva de qué cuenta como elegible.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const supabase: SupabaseClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Misma traducción reason_code -> texto legible ya establecida como capa de
// presentación en src/lib/feed.js (hallazgo corregido durante la auditoría
// final de la Fase 6) -- se duplica aquí porque esta función corre en el
// runtime aislado de una Edge Function (Deno), no en el bundle del cliente;
// el contenido es idéntico a propósito, para no inventar una segunda
// redacción de las mismas cuatro razones editoriales.
const EDITORIAL_REASON_LABELS: Record<string, string> = {
  seleccionado_equipo: "Seleccionado por el equipo editorial de Ahorita.",
  informacion_util: "Información útil que el equipo quiso destacar.",
  relevante_fecha: "Relevante para esta fecha, según el equipo editorial.",
  historia_ciudad: "Parte de la historia de la ciudad, según el equipo editorial.",
};

export type EditorialItem = {
  targetType: "event" | "publicacion";
  targetId: string;
  title: string;
  description: string | null;
  category: string | null;
  reason: string;
};

export type PlaceSummary = { name: string; area: string | null; category: string | null };

export type EventSummary = {
  title: string;
  category: string | null;
  locationName: string | null;
  startAt: string;
  price: number | null;
  tag: string | null;
};

export type PlaceContext = {
  type: "place";
  place: Record<string, unknown> | null;
  questions: Array<{ text: string; answers: Array<{ text: string; verified: boolean }> }>;
  statuses: Array<{ text: string }>;
  nearby: PlaceSummary[];
};

export type CityContext = {
  type: "city";
  places: PlaceSummary[];
  upcomingEvents: EventSummary[];
  editorial: EditorialItem[];
};

export type GuideContext = PlaceContext | CityContext;

// Universo elegible editorial vigente (Fase 6, Bloque 3/4) -- sin límite de
// cantidad, exactamente como devuelve candidatos_editorial(): decidir
// cuántos usar y en qué orden es responsabilidad de quien la consume, no de
// esta función ni de la propia RPC. Hidrata cada candidato con su
// contenido real (título/descripción/categoría) porque candidatos_editorial()
// deliberadamente no lo expone -- solo identidad y motivo, por diseño ya
// aprobado en la Fase 6.
async function fetchEditorialCandidates(): Promise<EditorialItem[]> {
  const { data: candidates, error } = await supabase.rpc("candidatos_editorial", {
    p_lat: null,
    p_lng: null,
    p_manual_zone_id: null,
  });
  if (error) throw error;
  if (!candidates || candidates.length === 0) return [];

  const eventIds = candidates.filter((c) => c.target_type === "event").map((c) => c.target_id);
  const publicationIds = candidates
    .filter((c) => c.target_type === "publicacion")
    .map((c) => c.target_id);

  const [eventsRes, publicationsRes] = await Promise.all([
    eventIds.length
      ? supabase.from("events").select("id, title, description, category").in("id", eventIds)
      : Promise.resolve({ data: [], error: null }),
    publicationIds.length
      ? supabase
          .from("publication_posts")
          .select("publication_id, body, category")
          .in("publication_id", publicationIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (eventsRes.error) throw eventsRes.error;
  if (publicationsRes.error) throw publicationsRes.error;

  const eventsById = new Map((eventsRes.data ?? []).map((e) => [e.id, e]));
  const postsById = new Map((publicationsRes.data ?? []).map((p) => [p.publication_id, p]));

  const items: EditorialItem[] = [];
  for (const candidate of candidates) {
    const reason = EDITORIAL_REASON_LABELS[candidate.reason_code] ?? EDITORIAL_REASON_LABELS.seleccionado_equipo;
    if (candidate.target_type === "event") {
      const event = eventsById.get(candidate.target_id);
      // Contenido que candidatos_editorial() ya consideró elegible pero que
      // dejó de estarlo entre esa lectura y esta -- se omite honestamente,
      // mismo principio ya aplicado en getComposedFeed() (Fase 6, Bloque 4).
      if (!event) continue;
      items.push({
        targetType: "event",
        targetId: candidate.target_id,
        title: event.title,
        description: event.description,
        category: event.category,
        reason,
      });
    } else {
      const post = postsById.get(candidate.target_id);
      if (!post) continue;
      items.push({
        targetType: "publicacion",
        targetId: candidate.target_id,
        title: post.body.slice(0, 80),
        description: post.body,
        category: post.category,
        reason,
      });
    }
  }
  return items;
}

export async function buildPlaceContext(placeId: string): Promise<PlaceContext> {
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

  if (placeRes.error) throw placeRes.error;

  const place = placeRes.data;
  const nearby = (nearbyRes.data ?? [])
    .filter((p) => p.area === place?.area)
    .slice(0, 8)
    .map((p) => ({ name: p.name, area: p.area, category: p.channel_default }));

  return {
    type: "place",
    place,
    questions: questionsRes.data ?? [],
    statuses: statusesRes.data ?? [],
    nearby,
  };
}

const EMPTY_CITY_CONTEXT: CityContext = { type: "city", places: [], upcomingEvents: [], editorial: [] };

// Fase 7 -- cierre (auditoría transversal, hallazgo H4): cada una de las
// tres fuentes se degrada de forma INDEPENDIENTE ante su propio fallo
// (transitorio de Postgres, o de la propia candidatos_editorial()/RPC) --
// exactamente la misma disciplina de degradación honesta que ya rige
// Memoria de Sesión, Conocimiento Permanente y Afinidad desde sus propios
// bloques. Un fallo en eventos nunca debe borrar lugares que sí se
// leyeron con éxito, y viceversa -- antes, un solo `Promise.all` fallaba
// en conjunto ante cualquiera de los tres, perdiendo silenciosamente
// contenido que sí estaba disponible.
export async function buildCityContext(): Promise<CityContext> {
  const now = new Date().toISOString();

  const places = await supabase
    .from("places")
    .select("name, area, channel_default")
    .limit(40)
    .then(({ data, error }) => {
      if (error) throw error;
      return (data ?? []).map((p) => ({ name: p.name, area: p.area, category: p.channel_default }));
    })
    .catch((error) => {
      console.error("Contexto: fallo al leer lugares, se continúa sin ellos en este turno:", error);
      return [] as PlaceSummary[];
    });

  const upcomingEvents = await supabase
    .from("events")
    .select("title, category, location_name, start_at, price, tag")
    .eq("status", "publicado")
    .gte("start_at", now)
    .order("start_at", { ascending: true })
    .limit(20)
    .then(({ data, error }) => {
      if (error) throw error;
      return (data ?? []).map((e) => ({
        title: e.title,
        category: e.category,
        locationName: e.location_name,
        startAt: e.start_at,
        price: e.price,
        tag: e.tag,
      }));
    })
    .catch((error) => {
      console.error("Contexto: fallo al leer eventos próximos, se continúa sin ellos en este turno:", error);
      return [] as EventSummary[];
    });

  const editorial = await fetchEditorialCandidates().catch((error) => {
    console.error("Contexto: fallo al leer candidatos editoriales, se continúa sin ellos en este turno:", error);
    return [] as EditorialItem[];
  });

  return { type: "city", places, upcomingEvents, editorial };
}

// Fase 7 -- cierre (hallazgo H4): antes, cualquier fallo al construir el
// contexto (un placeId de un lugar ya borrado, un error transitorio de
// Postgres) propagaba la excepción hasta el catch más externo de
// index.ts, que respondía con un 500 crudo -- el turno entero nunca
// llegaba a El Razonador ni a La Expresión, a diferencia de cualquier otro
// fallo del pipeline (Memoria, Conocimiento Permanente, Afinidad), que
// siempre degradan y dejan que el turno continúe. Ahora un fallo al
// construir la ficha de un lugar específico (el propio lugar no existe --
// código PGRST116 de una fila no encontrada -- o un fallo transitorio de
// Postgres) se registra distinguiendo ambos casos, y se continúa con el
// contexto general de ciudad: la persona ya no está viendo la ficha de un
// negocio identificado, así que el contexto de ciudad sigue siendo
// legítimo, nunca una invención. Si construir el contexto de ciudad
// también falla, el último nivel de seguridad es un contexto vacío --
// nunca una excepción sin manejar. El Razonador ya sabe reconocer, con
// esta misma información real pero incompleta, que no tiene base
// suficiente para responder (regla ya vigente: "noAnswer": true).
export async function buildContext(placeId: string | null | undefined): Promise<GuideContext> {
  if (!placeId) {
    return buildCityContext().catch((error) => {
      console.error("Contexto: fallo al leer el contexto de ciudad, se continúa con un contexto vacío:", error);
      return EMPTY_CITY_CONTEXT;
    });
  }

  try {
    return await buildPlaceContext(placeId);
  } catch (error) {
    const isMissingPlace = (error as { code?: string })?.code === "PGRST116";
    console.error(
      isMissingPlace
        ? `Contexto: el lugar ${placeId} ya no existe, se continúa con el contexto de ciudad:`
        : "Contexto: fallo transitorio al construir la ficha del lugar, se continúa con el contexto de ciudad:",
      error
    );
    return buildCityContext().catch((cityError) => {
      console.error("Contexto: fallo al leer el contexto de ciudad, se continúa con un contexto vacío:", cityError);
      return EMPTY_CITY_CONTEXT;
    });
  }
}
