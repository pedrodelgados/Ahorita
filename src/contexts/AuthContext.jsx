import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const GUEST_KEY = "ahorita_guest_mode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(
    () => sessionStorage.getItem(GUEST_KEY) === "true"
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (newSession) {
          setIsGuest(false);
          sessionStorage.removeItem(GUEST_KEY);
        }
        // Enlace de recuperación de contraseña abierto: supabase-js ya
        // estableció una sesión de recuperación (ver arriba) — llevar a la
        // pantalla dedicada para completar el cambio con updateUser().
        if (event === "PASSWORD_RECOVERY") {
          navigate("/actualizar-contrasena");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  function continueAsGuest() {
    sessionStorage.setItem(GUEST_KEY, "true");
    setIsGuest(true);
  }

  function signUpWithEmail(email, password) {
    return supabase.auth.signUp({ email, password });
  }

  function signInWithEmail(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    await supabase.auth.signOut();
    sessionStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  }

  function updatePassword(password) {
    return supabase.auth.updateUser({ password });
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    isGuest,
    isAuthenticated: !!session,
    continueAsGuest,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
