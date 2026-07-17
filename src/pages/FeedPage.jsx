import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getFeed } from "../lib/feed";
import { getPlace } from "../lib/places";
import { getProfile } from "../lib/profile";
import { listLikeCounts, listMyLikedIds, likeTarget, unlikeTarget } from "../lib/postLikes";
import { COLORS } from "../styles/theme";
import CategoryPillsRow from "../features/feed/CategoryPillsRow";
import FeedCard from "../features/feed/FeedCard";
import GuideBar from "../features/ai/GuideBar";
import PlaceSheet from "../features/places/PlaceSheet";
import InterestsPrompt from "../features/auth/InterestsPrompt";

export default function FeedPage() {
  const { user, isGuest, isAuthenticated } = useAuth();
  const [channel, setChannel] = useState(null);
  const [items, setItems] = useState([]);
  const [likeState, setLikeState] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
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
    const idsByType = {};
    for (const item of feedItems) {
      (idsByType[item.targetType] ??= []).push(item.targetId);
    }

    const state = {};
    await Promise.all(
      Object.entries(idsByType).map(async ([targetType, ids]) => {
        const [counts, likedIds] = await Promise.all([
          listLikeCounts(targetType, ids),
          isAuthenticated ? listMyLikedIds(user.id, targetType) : Promise.resolve([]),
        ]);
        const likedSet = new Set(likedIds);
        for (const item of feedItems) {
          if (item.targetType !== targetType) continue;
          state[item.id] = { liked: likedSet.has(item.targetId), count: counts[item.targetId] ?? 0 };
        }
      })
    );
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

  async function handleOpenPlace(placeId) {
    const place = await getPlace(placeId);
    setSelectedPlace(place);
  }

  return (
    <div style={{ minHeight: "100svh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--color-bg)",
          borderBottom: "1px solid rgba(43, 38, 34, 0.08)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px 2px",
          }}
        >
          <h1 style={{ fontSize: 22 }}>Ahorita</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link to="/buscar" aria-label="Buscar" style={{ display: "flex" }}>
              <Search size={20} />
            </Link>
            <Link to="/notificaciones" aria-label="Notificaciones" style={{ display: "flex" }}>
              <Bell size={20} />
            </Link>
          </div>
        </header>

        <div style={{ padding: "4px 12px 0" }}>
          <CategoryPillsRow selected={channel} onSelect={setChannel} />
        </div>
        <div style={{ padding: "0 16px 12px" }}>
          <GuideBar />
        </div>
      </div>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "12px 12px 84px" }}>
        {showInterestsPrompt && (
          <InterestsPrompt userId={user.id} onDone={() => setDismissedPrompt(true)} />
        )}

        {isGuest && (
          <p
            style={{
              fontSize: 13,
              color: COLORS.inkSoft,
              background: "#FFFFFF",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              marginBottom: 16,
            }}
          >
            Estás explorando sin cuenta. Crea una para guardar lugares, comentar y publicar.
          </p>
        )}

        {loading && (
          <p style={{ textAlign: "center", color: COLORS.inkSoft, padding: "40px 0" }}>Cargando…</p>
        )}
        {!loading && items.length === 0 && (
          <p style={{ textAlign: "center", color: COLORS.inkSoft, padding: "40px 0" }}>
            Todavía no hay actividad en esta categoría.
          </p>
        )}
        {items.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            liked={likeState[item.id]?.liked ?? false}
            likeCount={likeState[item.id]?.count ?? 0}
            onToggleLike={() => toggleLike(item)}
            onOpenPlace={handleOpenPlace}
          />
        ))}
      </main>

      <PlaceSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </div>
  );
}
