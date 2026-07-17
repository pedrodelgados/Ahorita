import { listUpcomingEvents } from "./events";

const TAG_LABELS = {
  nuevo: "NUEVO",
  gratis: "GRATIS",
  hoy: "HOY",
  imperdible: "IMPERDIBLE",
  promocion: "PROMOCIÓN",
};

// Inicio es un feed exclusivamente de eventos (festivales, conciertos,
// ferias, funciones, carreras...) — no de lugares fijos. Ver PROJECT.md.
export async function getFeed({ channel } = {}) {
  const events = await listUpcomingEvents({ channel });

  return events.map((event) => ({
    id: `event-${event.id}`,
    type: "event",
    targetType: "event",
    targetId: event.id,
    eventId: event.id,
    channel: event.category,
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
