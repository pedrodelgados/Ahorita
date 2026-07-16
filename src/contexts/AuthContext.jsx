import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const GUEST_KEY = "ahorita_guest_mode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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
      (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          setIsGuest(false);
          sessionStorage.removeItem(GUEST_KEY);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
