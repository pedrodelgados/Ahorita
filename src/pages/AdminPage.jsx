import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getProfile } from "../lib/profile";
import {
  listPendingBusinesses,
  setBusinessStatus,
  deleteBusiness,
} from "../lib/businesses";
import { listUnverifiedAnswers, setAnswerVerified } from "../lib/questions";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [unverifiedAnswers, setUnverifiedAnswers] = useState([]);

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

  if (profile && !profile.is_admin) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "#948A80" }}>No tienes acceso a esta página.</p>
        <Button onClick={() => navigate("/")} style={{ marginTop: 16 }}>
          Volver a inicio
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
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Contenido</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          <Card
            style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            onClick={() => navigate("/admin/eventos")}
          >
            <Calendar size={20} color="#E8785C" />
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Eventos</p>
              <p style={{ fontSize: 12.5, color: "#948A80", margin: 0 }}>Ver, crear y editar</p>
            </div>
          </Card>
          <Card
            style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            onClick={() => navigate("/admin/lugares")}
          >
            <MapPin size={20} color="#4FA3A0" />
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Lugares</p>
              <p style={{ fontSize: 12.5, color: "#948A80", margin: 0 }}>Ver, crear y editar</p>
            </div>
          </Card>
        </div>

        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Negocios en revisión</h2>
        {pendingBusinesses.length === 0 ? (
          <p style={{ color: "#948A80", fontSize: 14, marginBottom: 28 }}>
            No hay negocios pendientes.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {pendingBusinesses.map((b) => (
              <Card key={b.id}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{b.name}</p>
                <p style={{ fontSize: 13, color: "#948A80", marginBottom: 10 }}>
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
          <p style={{ color: "#948A80", fontSize: 14 }}>
            No hay respuestas pendientes de verificar.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {unverifiedAnswers.map((a) => (
              <Card key={a.id}>
                <p style={{ fontSize: 13, color: "#948A80", marginBottom: 4 }}>
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
      </main>
    </div>
  );
}
