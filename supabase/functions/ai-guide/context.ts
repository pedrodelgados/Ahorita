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

export async function buildCityContext(): Promise<CityContext> {
  const now = new Date().toISOString();
  const [placesRes, eventsRes, editorial] = await Promise.all([
    supabase.from("places").select("name, area, channel_default").limit(40),
    supabase
      .from("events")
      .select("title, category, location_name, start_at, price, tag")
      .eq("status", "publicado")
      .gte("start_at", now)
      .order("start_at", { ascending: true })
      .limit(20),
    fetchEditorialCandidates(),
  ]);
  if (placesRes.error) throw placesRes.error;
  if (eventsRes.error) throw eventsRes.error;

  return {
    type: "city",
    places: (placesRes.data ?? []).map((p) => ({ name: p.name, area: p.area, category: p.channel_default })),
    upcomingEvents: (eventsRes.data ?? []).map((e) => ({
      title: e.title,
      category: e.category,
      locationName: e.location_name,
      startAt: e.start_at,
      price: e.price,
      tag: e.tag,
    })),
    editorial,
  };
}

export async function buildContext(placeId: string | null | undefined): Promise<GuideContext> {
  return placeId ? buildPlaceContext(placeId) : buildCityContext();
}
