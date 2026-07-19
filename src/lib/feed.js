import { listUpcomingEvents } from "./events";
import { listPublishedFeedPublications } from "./publications";
import { listPublishedFeedPromotions } from "./promotions";

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

// Fase 4, Bloque 2: Publicaciones se suma como segunda fuente real. A
// diferencia de un evento (fecha futura: "cuánto falta"), una Publicación
// vive en el presente/pasado reciente ("qué tan nueva es") — mezclarlas por
// valor de fecha ascendente crudo las separaría por completo (todas las
// publicaciones, con fechas pasadas, quedarían siempre antes que cualquier
// evento futuro). El criterio de orden correcto y compartido es la
// DISTANCIA ABSOLUTA respecto a "ahora": un evento en 2 horas y una
// publicación de hace 10 minutos quedan naturalmente cerca; algo lejano en
// cualquier dirección se hunde por igual. Con una sola fuente (solo
// eventos, todos futuros) esto da exactamente el mismo orden que antes —
// el Bloque 1 sigue pasando sus mismas pruebas sin cambios.
function mapPublicationToFeedItem(pub) {
  return {
    id: `publicacion-${pub.id}`,
    type: "publicacion",
    targetType: "publicacion",
    targetId: pub.id,
    publicationId: pub.id,
    actorId: pub.actorId,
    channel: pub.category,
    variant: "normal",
    image: pub.imageUrl,
    mediaType: "image",
    mediaUrl: pub.imageUrl,
    title: pub.authorName,
    description: pub.body,
    sortAt: pub.publishedAt,
    verificationBadge: pub.verificationBadge,
    edited: pub.edited,
    publishedAt: pub.publishedAt,
  };
}

// Fase 4, Bloque 3: Promoción se suma como tercera fuente, sin ningún
// algoritmo nuevo — un solo criterio de orden (distancia a "ahora"), cada
// fuente decide su propio sortAt según su propia fase, exactamente como ya
// hacen Eventos (siempre start_at) y Publicaciones (siempre published_at).
// Una Promoción cambia de fase con el tiempo, así que su sortAt es el
// momento que la hace relevante ahora mismo: por empezar → starts_at
// (genera expectativa, ventana de 24h ya resuelta por list_feed_promotions);
// vigente o recién finalizada → ends_at/ended_early_at (la urgencia de que
// se acabe, o el cierre honesto de que ya se acabó, son la misma señal de
// "cuánto falta/hace" que ya usan Eventos).
function mapPromotionToFeedItem(promo) {
  const sortAt =
    promo.computedStatus === "programada_proxima" ? promo.startsAt : promo.endedEarlyAt || promo.endsAt;
  return {
    id: `promocion-${promo.id}`,
    type: "promocion",
    targetType: "promocion",
    targetId: promo.id,
    publicationId: promo.id,
    actorId: promo.actorId,
    variant: "normal",
    image: promo.imageUrl,
    mediaType: "image",
    mediaUrl: promo.imageUrl,
    title: promo.authorName,
    promoTitle: promo.title,
    benefitDescription: promo.benefitDescription,
    redemptionCondition: promo.redemptionCondition,
    restrictions: promo.restrictions,
    startsAt: promo.startsAt,
    endsAt: promo.endsAt,
    endedEarlyAt: promo.endedEarlyAt,
    computedStatus: promo.computedStatus,
    sortAt,
    verificationBadge: promo.verificationBadge,
    publishedAt: promo.publishedAt,
  };
}

function mergeFeedSources(...sources) {
  const now = Date.now();
  return sources
    .flat()
    .sort(
      (a, b) =>
        Math.abs(now - new Date(a.sortAt).getTime()) - Math.abs(now - new Date(b.sortAt).getTime())
    );
}

// Inicio combina Eventos y Publicaciones (Fase 4) en un solo feed, siempre
// distinguibles por tipo — nunca mezclados sin jerarquía visual clara. El
// orden sigue siendo estrictamente temporal (ver mergeFeedSources); ranking
// por afinidad, personalización y contenido patrocinado quedan, a
// propósito, fuera de esta fase (Fase 6 y Fase 11).
export async function getFeed({ channel } = {}) {
  const [events, publications, promotions] = await Promise.all([
    listUpcomingEvents({ channel }),
    listPublishedFeedPublications(),
    listPublishedFeedPromotions(),
  ]);

  const eventItems = events.map(mapEventToFeedItem);
  const publicationItems = (channel ? publications.filter((p) => p.category === channel) : publications).map(
    mapPublicationToFeedItem
  );
  const promotionItems = promotions.map(mapPromotionToFeedItem);
  const items = mergeFeedSources(eventItems, publicationItems, promotionItems);

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
