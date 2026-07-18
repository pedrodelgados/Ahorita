import { listUpcomingEvents } from "./events";

const TAG_LABELS = {
  nuevo: "NUEVO",
  gratis: "GRATIS",
  hoy: "HOY",
  imperdible: "IMPERDIBLE",
  promocion: "PROMOCIÓN",
};

// Ritmo editorial del feed: no todas las publicaciones tienen la misma
// jerarquía visual (ver PROJECT.md, "Rediseño visual premium"). La variante
// se deriva siempre de datos reales — posición en el orden ya definido por
// proximidad en el tiempo, etiqueta del evento, o tipo de medio — nunca de
// datos inventados.
//   portada  → el evento más próximo en el tiempo, tratamiento de portada
//   destacado → marcado como "imperdible" por un admin
//   historia  → tiene video propio, se deja respirar sin texto de más
//   rapida    → gratis u hoy, recomendación rápida y compacta
//   normal    → todo lo demás
function getCardVariant(event, index) {
  if (index === 0) return "portada";
  if (event.tag === "imperdible") return "destacado";
  if (event.video_url) return "historia";
  if (event.tag === "hoy" || event.tag === "gratis") return "rapida";
  return "normal";
}

// "Selección del editor": no es contenido inventado — es un recorte de los
// mismos eventos reales del feed. Prioridad de la fuente:
//   1. Curaduría manual real (events.editor_pick = true, marcado por un
//      admin desde el panel) — así queda preparada la arquitectura para que
//      el equipo elija a mano qué aparece aquí, sin que el código decida.
//   2. Si no hay al menos 3 marcados a mano, cae al heurístico automático
//      de antes (nuevo/imperdible, o los próximos eventos).
// Solo aparece si hay al menos 3 eventos reales elegibles.
function pickEditorSelection(events) {
  const curated = events.filter((e) => e.editor_pick);
  if (curated.length >= 3) return curated.slice(0, 5);

  const featured = events.filter((e) => e.tag === "imperdible" || e.tag === "nuevo");
  const pool = featured.length >= 3 ? featured : events;
  return pool.slice(0, 5);
}

// Fase 4, Bloque 1 (ver FASE4_CONTRATO_ARQUITECTONICO.md): el feed deja de
// asumir una sola fuente de contenido. Cada fuente (hoy solo eventos; en
// bloques futuros también Publicaciones y Promociones) produce su propia
// lista de items ya en la forma común del feed, con `sortAt` como único
// criterio de orden compartido entre fuentes. `mergeFeedSources` es el
// contrato de composición: hoy combina una sola fuente (por eso el resultado
// es idéntico al feed anterior), y es el mismo punto donde una fuente nueva
// se sumará más adelante sin tocar el criterio de orden ya probado aquí.
function mapEventToFeedItem(event, index) {
  return {
    id: `event-${event.id}`,
    type: "event",
    targetType: "event",
    targetId: event.id,
    eventId: event.id,
    channel: event.category,
    variant: getCardVariant(event, index),
    image: event.image_url,
    mediaType: event.video_url ? "video" : "image",
    mediaUrl: event.video_url || event.image_url,
    title: event.title,
    location: event.location_name || event.business?.name,
    startAt: event.start_at,
    sortAt: event.start_at,
    endAt: event.end_at,
    description: event.description,
    tag: event.tag ? TAG_LABELS[event.tag] : null,
    price: event.price,
    ticketUrl: event.ticket_url,
    lat: event.lat,
    lng: event.lng,
    likesCount: event.likes_count,
    commentsCount: event.comments_count,
    raw: event,
  };
}

function mergeFeedSources(...sources) {
  return sources
    .flat()
    .sort((a, b) => new Date(a.sortAt).getTime() - new Date(b.sortAt).getTime());
}

// Inicio es un feed exclusivamente de eventos (festivales, conciertos,
// ferias, funciones, carreras...) — no de lugares fijos. Ver PROJECT.md.
export async function getFeed({ channel } = {}) {
  const events = await listUpcomingEvents({ channel });

  const eventItems = events.map(mapEventToFeedItem);
  const items = mergeFeedSources(eventItems);

  const selection = pickEditorSelection(events);
  if (selection.length >= 3) {
    items.splice(1, 0, {
      id: "editorial-seleccion-del-editor",
      kind: "editorial-shelf",
      title: "Selección del editor",
      subtitle: "Curado por el equipo",
      items: selection.map((e) => ({
        id: e.id,
        eventId: e.id,
        title: e.title,
        location: e.location_name || e.business?.name,
        image: e.image_url,
        category: e.category,
      })),
    });
  }

  return items;
}
