import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CalendarX2, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getFeed } from "../lib/feed";
import { getProfile } from "../lib/profile";
import { listMyLikedIds, likeTarget, unlikeTarget } from "../lib/postLikes";
import { withViewTransition } from "../lib/viewTransition";
import { COLORS, textStyle, TYPE } from "../styles/theme";
import AppHeader from "../components/layout/AppHeader";
import EmptyState from "../components/ui/EmptyState";
import { FeedCardSkeleton } from "../components/ui/LoadingSkeleton";
import CategoryPillsRow from "../features/feed/CategoryPillsRow";
import EditorialShelf from "../features/feed/EditorialShelf";
import FeedCard from "../features/feed/FeedCard";
import GuideCapsule from "../features/ai/GuideCapsule";
import EventSheet from "../features/events/EventSheet";
import InterestsPrompt from "../features/auth/InterestsPrompt";

export default function FeedPage() {
  const { user, isGuest, isAuthenticated } = useAuth();
  const [channel, setChannel] = useState(null);
  const [items, setItems] = useState([]);
  const [likeState, setLikeState] = useState({});
  const [loading, setLoading] = useState(true);
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
    getFeed({ channel }).then(async (feedItems) => {
      if (cancelled) return;
      setItems(feedItems);
      await loadLikeState(feedItems);
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  async function loadLikeState(feedItems) {
    const state = {};
    for (const item of feedItems) {
      state[item.id] = { liked: false, count: item.likesCount ?? 0 };
    }

    if (isAuthenticated) {
      const likedIds = await listMyLikedIds(user.id, "event");
      const likedSet = new Set(likedIds);
      for (const item of feedItems) {
        if (likedSet.has(item.targetId)) state[item.id].liked = true;
      }
    }

    setLikeState(state);
  }

  async function toggleLike(item) {
    const current = likeState[item.id] ?? { liked: false, count: 0 };
    const nextLiked = !current.liked;
    setLikeState((prev) => ({
      ...prev,
      [item.id]: { liked: nextLiked, count: Math.max(0, current.count + (nextLiked ? 1 : -1)) },
    }));
    try {
      if (nextLiked) await likeTarget(user.id, item.targetType, item.targetId);
      else await unlikeTarget(user.id, item.targetType, item.targetId);
    } catch {
      setLikeState((prev) => ({ ...prev, [item.id]: current }));
    }
  }

  return (
    <div style={{ minHeight: "100svh" }}>
      <AppHeader
        title="Ahorita"
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

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "12px 12px 84px" }}>
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
        {/* item.kind permite intercalar bloques editoriales (Selección del
            editor, rutas temáticas...) en el ritmo del feed más adelante —
            el sistema visual ya está preparado, pero getFeed() hoy solo
            produce eventos, así que este despacho no cambia nada todavía. */}
        {items.map((item) =>
          item.kind === "editorial-shelf" ? (
            <EditorialShelf key={item.id} title={item.title} subtitle={item.subtitle} items={item.items} />
          ) : (
            <FeedCard
              key={item.id}
              item={item}
              liked={likeState[item.id]?.liked ?? false}
              likeCount={likeState[item.id]?.count ?? 0}
              isOpen={selectedEventId === item.eventId}
              onToggleLike={() => toggleLike(item)}
              onOpenEvent={(id) => withViewTransition(() => setSelectedEventId(id))}
            />
          )
        )}
      </main>

      <EventSheet
        eventId={selectedEventId}
        onClose={() => withViewTransition(() => setSelectedEventId(null))}
      />
    </div>
  );
}
