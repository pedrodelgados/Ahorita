import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getProfile } from "../lib/profile";
import InterestsPrompt from "../features/auth/InterestsPrompt";
import Button from "../components/ui/Button";

export default function ExplorePage() {
  const { user, isGuest, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);

  useEffect(() => {
    if (user) getProfile(user.id).then(setProfile).catch(() => {});
  }, [user]);

  const showInterestsPrompt =
    user && profile && profile.interests.length === 0 && !dismissedPrompt;

  return (
    <div style={{ minHeight: "100svh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(43, 38, 34, 0.08)",
        }}
      >
        <h1 style={{ fontSize: 22 }}>Ahorita</h1>

        {user ? (
          <Button variant="ghost" style={{ padding: "8px 14px", fontSize: 14 }} onClick={signOut}>
            Cerrar sesión
          </Button>
        ) : (
          <Button
            style={{ padding: "8px 14px", fontSize: 14 }}
            onClick={() => navigate("/login")}
          >
            Crear cuenta
          </Button>
        )}
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        {showInterestsPrompt && (
          <InterestsPrompt
            userId={user.id}
            onDone={() => setDismissedPrompt(true)}
          />
        )}

        {isGuest && (
          <p
            style={{
              fontSize: 13,
              color: "#6b6360",
              background: "#FFFFFF",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              marginBottom: 24,
            }}
          >
            Estás explorando sin cuenta. Crea una para guardar lugares, comentar y publicar.
          </p>
        )}

        <div
          style={{
            textAlign: "center",
            color: "#6b6360",
            padding: "80px 20px",
            border: "1px dashed rgba(43, 38, 34, 0.15)",
            borderRadius: "var(--radius-card)",
          }}
        >
          Aquí irá la cuadrícula de lugares de Cuenca (próxima fase).
        </div>
      </main>
    </div>
  );
}
