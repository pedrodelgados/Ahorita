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

// Inicio es un feed exclusivamente de eventos (festivales, conciertos,
// ferias, funciones, carreras...) — no de lugares fijos. Ver PROJECT.md.
export async function getFeed({ channel } = {}) {
  const events = await listUpcomingEvents({ channel });

  return events.map((event, index) => ({
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
}
