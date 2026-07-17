import { supabase } from "./supabaseClient";

const TAG_LABELS = {
  nuevo: "NUEVO",
  gratis: "GRATIS",
  imperdible: "IMPERDIBLE",
  hoy: "HOY",
  evento: "EVENTO",
  promocion: "PROMOCIÓN",
};

async function fetchPlaceCards(channel) {
  let query = supabase.from("places").select("*").order("created_at", { ascending: false }).limit(20);
  if (channel) query = query.eq("channel_default", channel);
  const { data, error } = await query;
  if (error) throw error;

  return data.map((place) => ({
    id: `place-${place.id}`,
    type: "place",
    targetType: "place",
    targetId: place.id,
    placeId: place.id,
    lat: place.lat,
    lng: place.lng,
    channel: place.channel_default,
    image: place.image_url,
    mediaType: "image",
    title: place.name,
    location: place.area,
    createdAt: place.created_at,
    description: place.description,
    tag: place.tag ? TAG_LABELS[place.tag] : null,
    website: place.website,
    ticketsUrl: place.tickets_url,
    menuUrl: place.menu_url,
    raw: place,
  }));
}

async function fetchStatusCards(channel) {
  let query = supabase
    .from("statuses")
    .select("*, place:places(id, name, area, channel_default, lat, lng), author:profiles(id, username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(20);
  if (channel) query = query.eq("channel", channel);
  const { data, error } = await query;
  if (error) throw error;

  return data
    .filter((status) => status.place)
    .map((status) => ({
      id: `status-${status.id}`,
      type: "status",
      targetType: "status",
      targetId: status.id,
      placeId: status.place.id,
      lat: status.place.lat,
      lng: status.place.lng,
      channel: status.channel ?? status.place.channel_default,
      image: status.media_url,
      mediaType: status.media_type ?? "image",
      title: status.place.name,
      location: status.place.area,
      createdAt: status.created_at,
      description: status.text,
      tag: "HOY",
      author: status.author,
      raw: status,
    }));
}

async function fetchQuestionCards(channel) {
  let query = supabase
    .from("questions")
    .select("*, place:places(id, name, area, image_url, channel_default, lat, lng), author:profiles(id, username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(20);
  if (channel) query = query.eq("channel", channel);
  const { data, error } = await query;
  if (error) throw error;

  return data
    .filter((question) => question.place)
    .map((question) => ({
      id: `question-${question.id}`,
      type: "question",
      targetType: "question",
      targetId: question.id,
      placeId: question.place.id,
      lat: question.place.lat,
      lng: question.place.lng,
      channel: question.channel ?? question.place.channel_default,
      image: question.place.image_url,
      mediaType: "image",
      title: question.place.name,
      location: question.place.area,
      createdAt: question.created_at,
      description: question.text,
      tag: null,
      author: question.author,
      isQuestion: true,
      raw: question,
    }));
}

async function fetchEditorialCards() {
  const { data, error } = await supabase
    .from("editorial_posts")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(5);
  if (error) throw error;

  return data.map((post) => ({
    id: `editorial-${post.id}`,
    type: "editorial",
    targetType: "editorial_post",
    targetId: post.id,
    placeId: null,
    channel: null,
    image: post.image_url,
    mediaType: "image",
    title: post.title,
    location: "Ahorita recomienda",
    createdAt: post.published_at,
    description: (post.items ?? []).join(" · "),
    tag: "IMPERDIBLE",
    raw: post,
  }));
}

// Intercala las listas en vez de agruparlas por tipo, para que el feed se
// sienta mezclado orgánicamente (como Instagram) y no como secciones separadas.
function interleave(lists) {
  const result = [];
  const indices = lists.map(() => 0);
  let added = true;
  while (added) {
    added = false;
    for (let i = 0; i < lists.length; i++) {
      if (indices[i] < lists[i].length) {
        result.push(lists[i][indices[i]]);
        indices[i] += 1;
        added = true;
      }
    }
  }
  return result;
}

export async function getFeed({ channel } = {}) {
  const [places, statuses, questions, editorial] = await Promise.all([
    fetchPlaceCards(channel),
    fetchStatusCards(channel),
    fetchQuestionCards(channel),
    channel ? Promise.resolve([]) : fetchEditorialCards(),
  ]);

  return interleave([places, statuses, questions, editorial]);
}
