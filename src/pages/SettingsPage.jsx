import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMyActorId } from "../hooks/useMyActorId";
import { getProfile, updateProfile } from "../lib/profile";
import { listMySavedPlaces } from "../lib/interactions";
import { CHANNELS } from "../styles/theme";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import CategoryChip from "../components/ui/CategoryChip";
import PlaceCard from "../features/places/PlaceCard";
import PlaceSheet from "../features/places/PlaceSheet";
import PushToggle from "../features/notifications/PushToggle";
import PrivacySection from "../features/settings/PrivacySection";
import SupportSection from "../features/settings/SupportSection";

// Ajustes (Fase 3, Bloque C, Entrega 5): todo lo que antes vivía en
// ProfilePage y NO es "el perfil en sí" — cuenta, intereses, guardados,
// notificaciones, cierre de sesión. "Mis negocios" no vive aquí: ahora se
// gestiona desde el selector de perfil (ProfileSwitcherSheet), accesible
// directamente desde el perfil unificado.
export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const myActorId = useMyActorId();

  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    getProfile(user.id).then((p) => {
      setProfile(p);
      setUsername(p.username ?? "");
    });
    listMySavedPlaces(user.id).then(setSavedPlaces).catch(() => {});
  }, [user.id]);

  async function saveUsername() {
    setSavingUsername(true);
    try {
      const updated = await updateProfile(user.id, { username: username.trim() || null });
      setProfile(updated);
    } finally {
      setSavingUsername(false);
    }
  }

  async function toggleInterest(channelId) {
    const current = profile.interests ?? [];
    const next = current.includes(channelId)
      ? current.filter((c) => c !== channelId)
      : [...current, channelId];
    const updated = await updateProfile(user.id, { interests: next });
    setProfile(updated);
  }

  if (!profile) return null;

  return (
    <div style={{ minHeight: "100svh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 24px",
          borderBottom: "1px solid rgba(43, 38, 34, 0.08)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", display: "flex" }}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 20, flex: 1 }}>Ajustes</h1>
        <Button variant="ghost" style={{ padding: "8px 14px", fontSize: 14 }} onClick={signOut}>
          Cerrar sesión
        </Button>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px calc(84px + env(safe-area-inset-bottom))" }}>
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#E8785C",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontFamily: "var(--font-display)",
                flexShrink: 0,
              }}
            >
              {(profile.username || user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Elige un nombre de usuario"
                  style={{
                    flex: 1,
                    border: "1px solid rgba(43, 38, 34, 0.15)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 12px",
                    fontSize: 14,
                  }}
                />
                <Button
                  onClick={saveUsername}
                  disabled={savingUsername || username === (profile.username ?? "")}
                  style={{ padding: "8px 16px", fontSize: 13 }}
                >
                  Guardar
                </Button>
              </div>
              <p style={{ fontSize: 12, color: "#948A80", marginTop: 6 }}>{user.email}</p>
            </div>
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Tus intereses</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CHANNELS.map((c) => (
              <CategoryChip
                key={c.id}
                label={c.label}
                color={c.color}
                active={(profile.interests ?? []).includes(c.id)}
                onClick={() => toggleInterest(c.id)}
              />
            ))}
          </div>

          {profile.is_admin && (
            <Link
              to="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 16,
                fontSize: 13,
                color: "#4FA383",
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={15} />
              Panel de administración
            </Link>
          )}

          <PushToggle userId={user.id} />
        </Card>

        <PrivacySection userId={user.id} actorId={myActorId} />

        <SupportSection />

        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Lugares guardados</h2>
        {savedPlaces.length === 0 ? (
          <p style={{ color: "#948A80", fontSize: 14 }}>
            Todavía no has guardado ningún lugar.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            {savedPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} onClick={() => setSelectedPlace(place)} />
            ))}
          </div>
        )}
      </main>

      <PlaceSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </div>
  );
}
