import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { follow, listFollowingIds, unfollow } from "../lib/follows";

const FollowContext = createContext(null);

export function FollowProvider({ children }) {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setFollowingIds(new Set());
      return;
    }
    listFollowingIds(user.id)
      .then((ids) => setFollowingIds(new Set(ids)))
      .catch(() => {});
  }, [user]);

  const toggleFollow = useCallback(
    async (authorId) => {
      if (!user || authorId === user.id) return;
      const isFollowing = followingIds.has(authorId);
      if (isFollowing) {
        await unfollow(user.id, authorId);
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(authorId);
          return next;
        });
      } else {
        await follow(user.id, authorId);
        setFollowingIds((prev) => new Set(prev).add(authorId));
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
