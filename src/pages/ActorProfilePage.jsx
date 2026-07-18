import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getPublicActorProfile } from "../lib/actorProfile";
import { COLORS } from "../styles/theme";
import Card from "../components/ui/Card";
import ActorProfileHeader from "../features/profile/ActorProfileHeader";

// Perfil público unificado (Fase 3, Bloque C, Entrega 1): una sola ruta,
// /actor/:actorId, sirve tanto a un actor persona como a un actor negocio —
// el mismo eje de identidad de toda la Fase 3. Solo lectura por ahora; la
// edición, el catálogo, los eventos asociados y las acciones sociales
// llegan en las entregas siguientes del Bloque C.
export default function ActorProfilePage() {
  const { actorId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, data: null });
    getPublicActorProfile(actorId)
      .then((data) => {
        if (!cancelled) setState({ loading: false, error: null, data });
      })
      .catch((error) => {
        if (!cancelled) setState({ loading: false, error, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [actorId]);

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
        <h2 style={{ fontSize: 16, flex: 1 }}>Perfil</h2>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px calc(84px + env(safe-area-inset-bottom))" }}>
        {state.loading && <p style={{ color: COLORS.inkSoft, fontSize: 14 }}>Cargando…</p>}

        {state.error && (
          <p style={{ color: COLORS.inkSoft, fontSize: 14 }}>
            No pudimos encontrar este perfil. Puede que ya no esté disponible.
          </p>
        )}

        {state.data && (
          <Card>
            <ActorProfileHeader
              actor={state.data.actor}
              details={state.data.details}
              profile={state.data.profile}
              business={state.data.business}
              zone={state.data.zone}
            />
          </Card>
        )}
      </main>
    </div>
  );
}
