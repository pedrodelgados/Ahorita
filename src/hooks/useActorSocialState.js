import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  describeInteractionError,
  getActorInteractionCounts,
  getMyActorInteractions,
  toggleActorInteraction,
} from "../lib/interactions";

const COUNT_KEY = { seguimiento: "seguidores", guardado: "guardados" };
const STATE_KEY = { seguimiento: "following", guardado: "saved" };

// Fuente de estado única compartida por ActionBar y ActivityStrip (Entrega
// 6): antes cada uno consultaba `interactions` por su cuenta, así que
// togglear "Seguir" en uno nunca se reflejaba en el contador del otro. Se
// instancia una sola vez en ActorProfilePage y se pasa por props a ambos.
export function useActorSocialState(actorId) {
  const { user, isAuthenticated } = useAuth();
  const [counts, setCounts] = useState(null);
  const [mine, setMine] = useState({ following: false, saved: false });
  const [busy, setBusy] = useState({ following: false, saved: false });
  const [error, setError] = useState(null);
  const errorTimeout = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getActorInteractionCounts(actorId)
      .then((c) => {
        if (!cancelled) setCounts(c);
      })
      .catch(() => {
        if (!cancelled) setCounts(null);
      });
    return () => {
      cancelled = true;
    };
  }, [actorId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMine({ following: false, saved: false });
      return;
    }
    let cancelled = false;
    getMyActorInteractions(user.id, actorId)
      .then((s) => {
        if (!cancelled) setMine(s);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id, actorId]);

  useEffect(() => () => clearTimeout(errorTimeout.current), []);

  const toggle = useCallback(
    async (type) => {
      const stateKey = STATE_KEY[type];
      const countKey = COUNT_KEY[type];
      if (busy[stateKey]) return;

      const next = !mine[stateKey];
      setBusy((b) => ({ ...b, [stateKey]: true }));
      setError(null);
      setMine((m) => ({ ...m, [stateKey]: next }));
      setCounts((c) => (c ? { ...c, [countKey]: c[countKey] + (next ? 1 : -1) } : c));

      try {
        await toggleActorInteraction({
          viewerProfileId: user.id,
          targetActorId: actorId,
          type,
          active: !next,
        });
      } catch (err) {
        setMine((m) => ({ ...m, [stateKey]: !next }));
        setCounts((c) => (c ? { ...c, [countKey]: c[countKey] + (next ? -1 : 1) } : c));
        setError(describeInteractionError(err));
        clearTimeout(errorTimeout.current);
        errorTimeout.current = setTimeout(() => setError(null), 4000);
      } finally {
        setBusy((b) => ({ ...b, [stateKey]: false }));
      }
    },
    [mine, busy, user, actorId]
  );

  return {
    counts,
    mine,
    busy,
    error,
    toggleFollow: () => toggle("seguimiento"),
    toggleSave: () => toggle("guardado"),
  };
}
