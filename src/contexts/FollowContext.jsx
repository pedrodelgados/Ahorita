import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getActorIdForProfile } from "../lib/actorProfile";
import { listFollowedProfileIds, toggleActorInteraction } from "../lib/interactions";

const FollowContext = createContext(null);

// Entrega 6 (Fase 3, Bloque C): seguir una persona ya no escribe en
// `follows` (tabla legacy de la Fase 1, preservada solo como respaldo) —
// lee y escribe exclusivamente `interactions`, el mismo modelo que ya
// usaba seguir un negocio desde la Entrega 2. La forma pública del
// contexto (`followingIds` como Set de profile_id, `toggleFollow(profileId)`)
// se mantiene idéntica a propósito: `AuthorTag` no necesita ningún cambio.
export function FollowProvider({ children }) {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setFollowingIds(new Set());
      return;
    }
    listFollowedProfileIds(user.id)
      .then((ids) => setFollowingIds(new Set(ids)))
      .catch(() => {});
  }, [user]);

  const toggleFollow = useCallback(
    async (authorProfileId) => {
      if (!user || authorProfileId === user.id) return;
      const isFollowing = followingIds.has(authorProfileId);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.delete(authorProfileId);
        else next.add(authorProfileId);
        return next;
      });
      try {
        const targetActorId = await getActorIdForProfile(authorProfileId);
        await toggleActorInteraction({
          viewerProfileId: user.id,
          targetActorId,
          type: "seguimiento",
          active: isFollowing,
        });
      } catch {
        setFollowingIds((prev) => {
          const next = new Set(prev);
          if (isFollowing) next.add(authorProfileId);
          else next.delete(authorProfileId);
          return next;
        });
      }
    },
    [user, followingIds]
  );

  return (
    <FollowContext.Provider value={{ followingIds, toggleFollow }}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow debe usarse dentro de <FollowProvider>");
  return ctx;
}
