import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

// El "actor persona" del usuario autenticado (Fase 3, Bloque A: todo profile
// tiene exactamente un actor tipo persona). BottomNav y el switcher de perfil
// lo necesitan para saber a dónde apunta "Perfil" — nunca a un id fijo, ya
// que la pestaña ahora navega directamente al perfil unificado del actor.
export function useMyActorId() {
  const { user } = useAuth();
  const [actorId, setActorId] = useState(null);

  useEffect(() => {
    if (!user) {
      setActorId(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("actors")
      .select("id")
      .eq("profile_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        setActorId(error ? null : data.id);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return actorId;
}
