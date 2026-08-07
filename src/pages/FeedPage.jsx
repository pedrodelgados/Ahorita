import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CalendarX2, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getComposedFeed } from "../lib/feed";
import { getProfile } from "../lib/profile";
import { listMyLikedEventIds, toggleEventInteraction } from "../lib/interactions";
import { withViewTransition } from "../lib/viewTransition";
import { COLORS, textStyle, TYPE } from "../styles/theme";
import AppHeader from "../components/layout/AppHeader";
import EmptyState from "../components/ui/EmptyState";
import { FeedCardSkeleton } from "../components/ui/LoadingSkeleton";
import CategoryPillsRow from "../features/feed/CategoryPillsRow";
import EditorialShelf from "../features/feed/EditorialShelf";
import FeedCard from "../features/feed/FeedCard";
import PublicationFeedCard from "../features/feed/PublicationFeedCard";
import PromotionFeedCard from "../features/feed/PromotionFeedCard";
import GuideCapsule from "../features/ai/GuideCapsule";
import EventSheet from "../features/events/EventSheet";
import InterestsPrompt from "../features/auth/InterestsPrompt";

export default function FeedPage() {
  const { user, isGuest, isAuthenticated } = useAuth();
  const [channel, setChannel] = useState(null);
  const [items, setItems] = useState([]);
  const [editorialShelf, setEditorialShelf] = useState(null);
  const [likeState, setLikeState] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);

  useEffect(() => {
    if (user) getProfile(user.id).then(setProfile).catch(() => {});
  }, [user]);

  const showInterestsPrompt =
    user && profile && profile.interests.length === 0 && !dismissedPrompt;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getComposedFeed({ channel, actorId: user?.id }).then(async (page) => {
      if (cancelled) return;
      setItems(page.items);
      setEditorialShelf(page.editorialShelf);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
      await loadLikeState(page.items);
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, user?.id]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await getComposedFeed({
        channel,
        actorId: user?.id,
        afterTargetType: cursor.targetType,
        afterTargetId: cursor.targetId,
      });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
      await loadLikeState(page.items, /* append */ true);
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadLikeState(feedItems, append = false) {
    const state = {};
    for (const item of feedItems) {
      state[item.id] = { liked: false, count: item.likesCount ?? 0 };
    }

    if (isAuthenticated) {
      const likedIds = await listMyLikedEventIds(user.id);
      const likedSet = new Set(likedIds);
      for (const item of feedItems) {
        if (likedSet.has(item.targetId)) state[item.id].liked = true;
      }
    }

    setLikeState((prev) => (append ? { ...prev, ...state } : state));
  }

  async function toggleLike(item) {
    const current = likeState[item.id] ?? { liked: false, count: 0 };
    const nextLiked = !current.liked;
    setLikeState((prev) => ({
      ...prev,
      [item.id]: { liked: nextLiked, count: Math.max(0, current.count + (nextLiked ? 1 : -1)) },
    }));
    try {
      await toggleEventInteraction({
        viewerProfileId: user.id,
        eventId: item.targetId,
        type: "me_gusta",
        active: current.liked,
      });
    } catch {
      setLikeState((prev) => ({ ...prev, [item.id]: current }));
    }
  }

  return (
    <div style={{ minHeight: "100svh" }}>
      <AppHeader
        title="Ahorita — A2 update test"
        display
        right={
          <>
            <Link to="/buscar" aria-label="Buscar" style={{ display: "flex" }}>
              <Search size={20} />
            </Link>
            <Link to="/notificaciones" aria-label="Notificaciones" style={{ display: "flex" }}>
              <Bell size={20} />
            </Link>
          </>
        }
      >
        <div style={{ padding: "4px 12px 0" }}>
          <CategoryPillsRow selected={channel} onSelect={setChannel} />
        </div>
        <div style={{ padding: "0 16px 12px" }}>
          <GuideCapsule context="inicio" />
        </div>
      </AppHeader>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "12px 12px calc(84px + env(safe-area-inset-bottom))" }}>
        {showInterestsPrompt && (
          <InterestsPrompt userId={user.id} onDone={() => setDismissedPrompt(true)} />
        )}

        {isGuest && (
          <p
            style={{
              background: "#FFFFFF",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              marginBottom: 16,
              ...textStyle(TYPE.bodySmall, { color: COLORS.inkSoft, margin: 0, marginBottom: 16 }),
            }}
          >
            Estás explorando sin cuenta. Crea una para guardar eventos, comentar y publicar.
          </p>
        )}

        {loading && (
          <>
            <FeedCardSkeleton />
            <FeedCardSkeleton />
          </>
        )}
        {!loading && items.length === 0 && (
          <EmptyState
            icon={<CalendarX2 size={22} />}
            title="Todavía no hay eventos aquí"
            description="No hay eventos próximos en esta categoría por ahora. Prueba con otra o vuelve pronto."
          />
        )}
        {/* item.type despacha entre Publicación (Fase 4, Bloque 2),
            Promoción (Fase 4, Bloque 3) y una tarjeta de evento normal.
            La razón de composición (Fase 6, Bloque 4) se muestra como un
            subtítulo breve, honesto, nunca "porque el algoritmo lo decidió".
            "Selección del editor" es una superficie separada (mismo
            contenido, distinto carrusel) que se conserva en la misma
            posición relativa que tenía antes del Compositor -- justo
            después del primer ítem. */}
        {items.map((item, index) => (
          <div key={item.id}>
            {index === 1 && editorialShelf && (
              <EditorialShelf
                title="Selección del editor"
                subtitle="Curado por el equipo"
                items={editorialShelf}
                onOpenItem={(id) => withViewTransition(() => setSelectedEventId(id))}
              />
            )}
            {item.reason && (
              <p
                style={textStyle(TYPE.bodySmall, {
                  color: COLORS.inkSoft,
                  margin: "0 4px 4px",
                  fontSize: 12,
                })}
              >
                {item.reason}
              </p>
            )}
            {item.type === "publicacion" ? (
              <PublicationFeedCard item={item} />
            ) : item.type === "promocion" ? (
              <PromotionFeedCard item={item} />
            ) : (
              <FeedCard
                item={item}
                liked={likeState[item.id]?.liked ?? false}
                likeCount={likeState[item.id]?.count ?? 0}
                isOpen={selectedEventId === item.eventId}
                onToggleLike={() => toggleLike(item)}
                onOpenEvent={(id) => withViewTransition(() => setSelectedEventId(id))}
              />
            )}
          </div>
        ))}
        {items.length === 1 && editorialShelf && (
          <EditorialShelf
            title="Selección del editor"
            subtitle="Curado por el equipo"
            items={editorialShelf}
            onOpenItem={(id) => withViewTransition(() => setSelectedEventId(id))}
          />
        )}

        {!loading && hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              display: "block",
              width: "100%",
              padding: "12px",
              margin: "8px 0",
              background: "none",
              border: "1px solid rgba(43, 38, 34, 0.15)",
              borderRadius: "var(--radius-sm)",
              ...textStyle(TYPE.bodySmall, { color: COLORS.inkSoft, margin: 0 }),
            }}
          >
            {loadingMore ? "Cargando…" : "Cargar más"}
          </button>
        )}
      </main>

      <EventSheet
        eventId={selectedEventId}
        onClose={() => withViewTransition(() => setSelectedEventId(null))}
      />
    </div>
  );
}
