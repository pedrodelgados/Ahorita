import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { listMySavedPlaceIds, toggleSavedPlace } from "../lib/interactions";

const SavedPlacesContext = createContext(null);

export function SavedPlacesProvider({ children }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    listMySavedPlaceIds(user.id)
      .then((ids) => setSavedIds(new Set(ids)))
      .catch(() => {});
  }, [user]);

  const toggleSave = useCallback(
    async (placeId) => {
      if (!user) return;
      const isSaved = savedIds.has(placeId);
      await toggleSavedPlace({ viewerProfileId: user.id, placeId, active: isSaved });
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(placeId);
        else next.add(placeId);
        return next;
      });
    },
    [user, savedIds]
  );

  return (
    <SavedPlacesContext.Provider value={{ savedIds, toggleSave }}>
      {children}
    </SavedPlacesContext.Provider>
  );
}

export function useSavedPlaces() {
  const ctx = useContext(SavedPlacesContext);
  if (!ctx) throw new Error("useSavedPlaces debe usarse dentro de <SavedPlacesProvider>");
  return ctx;
}
