import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { listSavedEventIds, saveEvent, unsaveEvent } from "../lib/savedEvents";

const SavedEventsContext = createContext(null);

export function SavedEventsProvider({ children }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    listSavedEventIds(user.id)
      .then((ids) => setSavedIds(new Set(ids)))
      .catch(() => {});
  }, [user]);

  const toggleSave = useCallback(
    async (eventId) => {
      if (!user) return;
      const isSaved = savedIds.has(eventId);
      if (isSaved) {
        await unsaveEvent(user.id, eventId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      } else {
        await saveEvent(user.id, eventId);
        setSavedIds((prev) => new Set(prev).add(eventId));
      }
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
