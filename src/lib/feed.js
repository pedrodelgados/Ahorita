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
// mismos eventos reales del feed (los marcados nuevo/imperdible por un
// admin, o los próximos si no hay suficientes con esas etiquetas), mostrado
// en un formato distinto para romper el ritmo vertical. Solo aparece si hay
// al menos 3 eventos reales elegibles.
function pickEditorSelection(events) {
  const featured = events.filter((e) => e.tag === "imperdible" || e.tag === "nuevo");
  const pool = featured.length >= 3 ? featured : events;
  return pool.slice(0, 5);
}

// Inicio es un feed exclusivamente de eventos (festivales, conciertos,
// ferias, funciones, carreras...) — no de lugares fijos. Ver PROJECT.md.
export async function getFeed({ channel } = {}) {
  const events = await listUpcomingEvents({ channel });

  const items = events.map((event, index) => ({
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
  }));

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
      })),
    });
  }

  return items;
}
