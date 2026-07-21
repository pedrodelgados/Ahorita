import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { listMySavedEventIds, toggleSavedEvent } from "../lib/interactions";

const SavedEventsContext = createContext(null);

export function SavedEventsProvider({ children }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    listMySavedEventIds(user.id)
      .then((ids) => setSavedIds(new Set(ids)))
      .catch(() => {});
  }, [user]);

  const toggleSave = useCallback(
    async (eventId) => {
      if (!user) return;
      const isSaved = savedIds.has(eventId);
      await toggleSavedEvent({ viewerProfileId: user.id, eventId, active: isSaved });
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(eventId);
        else next.add(eventId);
        return next;
      });
    },
    [user, savedIds]
  );

  return (
    <SavedEventsContext.Provider value={{ savedIds, toggleSave }}>
      {children}
    </SavedEventsContext.Provider>
  );
}

export function useSavedEvents() {
  const ctx = useContext(SavedEventsContext);
  if (!ctx) throw new Error("useSavedEvents debe usarse dentro de <SavedEventsProvider>");
  return ctx;
}
