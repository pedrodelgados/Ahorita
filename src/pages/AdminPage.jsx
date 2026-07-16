import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getProfile } from "../lib/profile";
import {
  listPendingBusinesses,
  setBusinessStatus,
  deleteBusiness,
} from "../lib/businesses";
import { createPlace } from "../lib/places";
import { listUnverifiedAnswers, setAnswerVerified } from "../lib/questions";
import { CHANNELS } from "../styles/theme";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const emptyPlace = { name: "", area: "", channel_default: CHANNELS[0].id, image_url: "", lat: "", lng: "" };

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [unverifiedAnswers, setUnverifiedAnswers] = useState([]);
  const [placeForm, setPlaceForm] = useState(emptyPlace);
  const [savingPlace, setSavingPlace] = useState(false);

  useEffect(() => {
    getProfile(user.id).then(setProfile);
  }, [user.id]);

  useEffect(() => {
    if (!profile?.is_admin) return;
    listPendingBusinesses().then(setPendingBusinesses).catch(() => {});
    listUnverifiedAnswers().then(setUnverifiedAnswers).catch(() => {});
  }, [profile?.is_admin]);

  async function approveBusiness(id) {
    await setBusinessStatus(id, "aprobado");
    setPendingBusinesses((prev) => prev.filter((b) => b.id !== id));
  }

  async function rejectBusiness(id) {
    await deleteBusiness(id);
    setPendingBusinesses((prev) => prev.filter((b) => b.id !== id));
  }

  async function verifyAnswer(id) {
    await setAnswerVerified(id, true);
    setUnverifiedAnswers((prev) => prev.filter((a) => a.id !== id));
  }

  async function submitPlace(e) {
    e.preventDefault();
    if (!placeForm.name.trim()) return;
    setSavingPlace(true);
    try {
      await createPlace({
        name: placeForm.name.trim(),
        area: placeForm.area.trim() || null,
        channel_default: placeForm.channel_default,
        image_url: placeForm.image_url.trim() || null,
        lat: placeForm.lat ? Number(placeForm.lat) : null,
        lng: placeForm.lng ? Number(placeForm.lng) : null,
      });
      setPlaceForm(emptyPlace);
    } finally {
      setSavingPlace(false);
    }
  }

  if (profile && !profile.is_admin) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "#6b6360" }}>No tienes acceso a esta página.</p>
        <Button onClick={() => navigate("/explorar")} style={{ marginTop: 16 }}>
          Volver a explorar
        </Button>
      </div>
    );
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
          onClick={() => navigate("/perfil")}
          style={{ background: "none", border: "none", display: "flex" }}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 20 }}>Panel de administración</h1>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Negocios en revisión</h2>
        {pendingBusinesses.length === 0 ? (
          <p style={{ color: "#6b6360", fontSize: 14, marginBottom: 28 }}>
            No hay negocios pendientes.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {pendingBusinesses.map((b) => (
              <Card key={b.id}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{b.name}</p>
                <p style={{ fontSize: 13, color: "#6b6360", marginBottom: 10 }}>
                  {b.category} · {b.address || "sin dirección"}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={() => approveBusiness(b.id)} style={{ padding: "8px 16px", fontSize: 13 }}>
                    Aprobar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => rejectBusiness(b.id)}
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    Rechazar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Respuestas sin verificar</h2>
        {unverifiedAnswers.length === 0 ? (
          <p style={{ color: "#6b6360", fontSize: 14, marginBottom: 28 }}>
            No hay respuestas pendientes de verificar.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {unverifiedAnswers.map((a) => (
              <Card key={a.id}>
                <p style={{ fontSize: 13, color: "#6b6360", marginBottom: 4 }}>
                  {a.question?.place?.name} · {a.question?.text}
                </p>
                <p style={{ fontSize: 14, marginBottom: 10 }}>{a.text}</p>
                <Button onClick={() => verifyAnswer(a.id)} style={{ padding: "8px 16px", fontSize: 13 }}>
                  Marcar como verificada
                </Button>
              </Card>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Cargar un lugar nuevo</h2>
        <Card>
          <form onSubmit={submitPlace} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              placeholder="Nombre"
              value={placeForm.name}
              onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Zona (ej. Centro Histórico)"
              value={placeForm.area}
              onChange={(e) => setPlaceForm({ ...placeForm, area: e.target.value })}
              style={inputStyle}
            />
            <select
              value={placeForm.channel_default}
              onChange={(e) => setPlaceForm({ ...placeForm, channel_default: e.target.value })}
              style={inputStyle}
            >
              {CHANNELS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              placeholder="URL de la imagen"
              value={placeForm.image_url}
              onChange={(e) => setPlaceForm({ ...placeForm, image_url: e.target.value })}
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <input
                placeholder="Latitud"
                type="number"
                step="any"
                value={placeForm.lat}
                onChange={(e) => setPlaceForm({ ...placeForm, lat: e.target.value })}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                placeholder="Longitud"
                type="number"
                step="any"
                value={placeForm.lng}
                onChange={(e) => setPlaceForm({ ...placeForm, lng: e.target.value })}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            <Button type="submit" disabled={savingPlace} style={{ padding: "10px 18px", fontSize: 14 }}>
              {savingPlace ? "Guardando…" : "Crear lugar"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: 14,
  background: "#FFFFFF",
  boxSizing: "border-box",
};
