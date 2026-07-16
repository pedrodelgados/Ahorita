import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { listSavedPlaceIds, savePlace, unsavePlace } from "../lib/savedPlaces";

const SavedPlacesContext = createContext(null);

export function SavedPlacesProvider({ children }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    listSavedPlaceIds(user.id)
      .then((ids) => setSavedIds(new Set(ids)))
      .catch(() => {});
  }, [user]);

  const toggleSave = useCallback(
    async (placeId) => {
      if (!user) return;
      const isSaved = savedIds.has(placeId);
      if (isSaved) {
        await unsavePlace(user.id, placeId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(placeId);
          return next;
        });
      } else {
        await savePlace(user.id, placeId);
        setSavedIds((prev) => new Set(prev).add(placeId));
      }
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
