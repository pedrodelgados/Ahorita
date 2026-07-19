import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getAhoritaEditorialActorId } from "../../lib/publications";
import PublicationsSection from "../../features/profile/PublicationsSection";

// Fase 4, Bloque 2: el equipo publica como "Ahorita Editorial" reutilizando
// exactamente el mismo composer y la misma sección que un negocio — la
// única diferencia es el Actor fijo y que llegar aquí ya exige is_admin()
// (esta ruta vive bajo /admin, que ya está protegida por AdminPage/RLS).
export default function AdminEditorialPage() {
  const navigate = useNavigate();
  const [actorId, setActorId] = useState(null);

  useEffect(() => {
    getAhoritaEditorialActorId().then(setActorId).catch(() => setActorId(null));
  }, []);

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
        <button onClick={() => navigate("/admin")} style={{ background: "none", border: "none", display: "flex" }} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 18 }}>Ahorita Editorial</h1>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        {actorId && (
          <PublicationsSection actorId={actorId} authorName="Ahorita Editorial" canEdit />
        )}
      </main>
    </div>
  );
}
