import { supabase } from "./supabaseClient";
import { listUpcomingEvents } from "./events";
import { listPublishedFeedPublications } from "./publications";
import { listPublishedFeedPromotions } from "./promotions";
import { listEditorialSelectedEventIds } from "./editorial";

const TAG_LABELS = {
  nuevo: "NUEVO",
  gratis: "GRATIS",
  hoy: "HOY",
  imperdible: "IMPERDIBLE",
  promocion: "PROMOCIÓN",
};

// Fase 6, Bloque 3 (ver PROJECT.md): candidatos_editorial() devuelve a propósito
// el reason_code técnico, nunca una frase ya construida ("permitiendo varias
// redacciones por código sin multiplicar el catálogo") -- la capa de
// presentación que las traduce es esta, no la base de datos. Corrección de la
// auditoría final de cierre de la Fase 6: antes de esto, el código crudo
// (p. ej. "seleccionado_equipo") llegaba sin traducir hasta la pantalla.
const EDITORIAL_REASON_LABELS = {
  seleccionado_equipo: "Seleccionado por el equipo editorial de Ahorita.",
  informacion_util: "Información útil que el equipo quiso destacar.",
  relevante_fecha: "Relevante para esta fecha, según el equipo editorial.",
  historia_ciudad: "Parte de la historia de la ciudad, según el equipo editorial.",
};

function resolveComposedReason(row) {
  if (row.owning_carril !== "editorial") return row.reason;
  return EDITORIAL_REASON_LABELS[row.reason] ?? EDITORIAL_REASON_LABELS.seleccionado_equipo;
}

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
//   1. Curaduría manual real (Fase 6, Bloque 3: Motor Editorial --
//      editorial_selections, ver lib/editorial.js -- reemplaza a
//      events.editor_pick, ya legacy desde la migración 0040).
//   2. Si no hay al menos 3 marcados a mano, cae al heurístico automático
//      de antes (nuevo/imperdible, o los próximos eventos).
// Solo aparece si hay al menos 3 eventos reales elegibles.
function pickEditorSelection(events, selectedEventIds) {
  const curated = events.filter((e) => selectedEventIds.has(e.id));
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

// Fase 6, Bloque 4: el Compositor del Feed. Sustituye el orden puramente
// cronológico de mergeFeedSources por la composición determinista de
// compose_feed() (seis entradas, cupos proporcionales, anti-monopolio,
// paginación por clave de identidad) -- reutiliza sin cambios las mismas
// funciones de obtención y de mapeo a tarjeta ya usadas por getFeed(), para
// que ningún tipo de contenido ni variante visual se pierda en la
// transición. getFeed() se conserva intacta como camino de reversión --
// ver PROJECT.md, Bloque 4, sección de reversión.
export async function getComposedFeed({
  channel,
  actorId,
  afterTargetType,
  afterTargetId,
  pageSize = 20,
} = {}) {
  const { data: composed, error } = await supabase.rpc("compose_feed", {
    p_actor_id: actorId ?? null,
    p_lat: null,
    p_lng: null,
    p_manual_zone_id: null,
    p_channel: channel ?? null,
    p_after_target_type: afterTargetType ?? null,
    p_after_target_id: afterTargetId ?? null,
    p_page_size: pageSize,
  });
  if (error) throw error;

  const [events, publications, promotions] = await Promise.all([
    listUpcomingEvents({ channel }),
    listPublishedFeedPublications(),
    listPublishedFeedPromotions(),
  ]);

  const eventsById = new Map(events.map((e) => [e.id, e]));
  const publicationsById = new Map((channel ? publications.filter((p) => p.category === channel) : publications).map((p) => [p.id, p]));
  const promotionsById = new Map(promotions.map((p) => [p.id, p]));

  const items = [];
  composed.forEach((row, index) => {
    let item = null;
    if (row.target_type === "event") {
      const event = eventsById.get(row.target_id);
      if (event) item = mapEventToFeedItem(event, index);
    } else if (row.target_type === "publicacion") {
      const pub = publicationsById.get(row.target_id);
      if (pub) item = mapPublicationToFeedItem(pub);
    } else if (row.target_type === "promocion") {
      const promo = promotionsById.get(row.target_id);
      if (promo) item = mapPromotionToFeedItem(promo);
    }
    // Contenido que compose_feed() ya consideró elegible pero que dejó de
    // estarlo entre esa lectura y esta (p. ej. venció justo ahora): se omite
    // honestamente, nunca se rellena con un item inventado.
    if (item) {
      items.push({
        ...item,
        reason: resolveComposedReason(row),
        owningCarril: row.owning_carril,
        geoStatus: row.geo_status,
      });
    }
  });

  const last = composed[composed.length - 1];

  // La "Selección del editor" es una superficie de presentación separada
  // (un carrusel curado, no un carril del Compositor) -- coexiste con los
  // ítems editoriales que ya aparecen intercalados en items[] arriba, sin
  // conflicto, porque ninguna de las dos escribe nada (ver PROJECT.md,
  // Bloque 4, sección de Editorial). Solo se calcula en la primera página.
  let editorialShelf = null;
  if (!afterTargetId) {
    const selectedEventIds = await listEditorialSelectedEventIds().then((ids) => new Set(ids));
    const selection = pickEditorSelection(events, selectedEventIds);
    if (selection.length >= 3) {
      editorialShelf = selection.map((e) => ({
        id: e.id,
        eventId: e.id,
        title: e.title,
        location: e.location_name || e.business?.name,
        image: e.image_url,
        category: e.category,
      }));
    }
  }

  return {
    items,
    editorialShelf,
    nextCursor: last ? { targetType: last.target_type, targetId: last.target_id } : null,
    hasMore: composed.length === pageSize,
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
  const [events, publications, promotions, selectedEventIds] = await Promise.all([
    listUpcomingEvents({ channel }),
    listPublishedFeedPublications(),
    listPublishedFeedPromotions(),
    listEditorialSelectedEventIds().then((ids) => new Set(ids)),
  ]);

  const eventItems = events.map(mapEventToFeedItem);
  const publicationItems = (channel ? publications.filter((p) => p.category === channel) : publications).map(
    mapPublicationToFeedItem
  );
  const promotionItems = promotions.map(mapPromotionToFeedItem);
  const items = mergeFeedSources(eventItems, publicationItems, promotionItems);

  const selection = pickEditorSelection(events, selectedEventIds);
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
