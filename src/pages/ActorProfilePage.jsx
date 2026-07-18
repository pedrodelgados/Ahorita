import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronsUpDown, Pencil, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMyActorId } from "../hooks/useMyActorId";
import { getPublicActorProfile, canEditActor } from "../lib/actorProfile";
import { COLORS, SPACE } from "../styles/theme";
import Card from "../components/ui/Card";
import ActorProfileHeader from "../features/profile/ActorProfileHeader";
import ActivityStrip from "../features/profile/ActivityStrip";
import ActionBar from "../features/profile/ActionBar";
import CatalogSection from "../features/profile/CatalogSection";
import EventsShelf from "../features/profile/EventsShelf";
import GallerySection from "../features/profile/GallerySection";
import GuideTeaser from "../features/profile/GuideTeaser";
import AboutSection from "../features/profile/AboutSection";
import ProfileSwitcherSheet from "../features/profile/ProfileSwitcherSheet";

// Perfil público unificado (Fase 3, Bloque C): una sola ruta,
// /actor/:actorId, sirve tanto a un actor persona como a un actor negocio —
// el mismo eje de identidad de toda la Fase 3.
//
// Entrega 1: identidad de solo lectura (foto/portada/nombre/bio/categoría/
// insignia/estado abierto-cerrado).
// Entrega 2 ("Centro del Negocio"): actividad real (guardados/seguidores),
// acciones (seguir/guardar/compartir/contacto), catálogo por colecciones,
// eventos asociados, galería, tarjeta de la Guía IA y "Acerca de" —
// exclusivo de actores negocio; el perfil de persona queda igual que en la
// Entrega 1. Cada sección decide sola si tiene datos reales para existir:
// sin eso, no se monta — nunca un contenedor vacío.
export default function ActorProfilePage() {
  const { actorId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const myActorId = useMyActorId();
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [canEdit, setCanEdit] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

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

  const isNegocio = state.data?.actor.type !== "persona" && !!state.data?.business;
  const isOwnPersona = isAuthenticated && !!myActorId && actorId === myActorId;
  // El selector aparece siempre que este perfil sea "mío" en algún sentido:
  // mi propia persona, o un negocio que poseo/administro (mismo criterio que
  // habilita el lápiz de edición) — así el usuario siempre puede saltar de
  // un perfil propio a otro sin volver primero a "Tú".
  const canSwitch = isOwnPersona || canEdit;

  useEffect(() => {
    if (!isNegocio || !isAuthenticated) {
      setCanEdit(false);
      return;
    }
    let cancelled = false;
    canEditActor(actorId)
      .then((allowed) => {
        if (!cancelled) setCanEdit(allowed);
      })
      .catch(() => {
        if (!cancelled) setCanEdit(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actorId, isNegocio, isAuthenticated]);

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {canSwitch && (
            <button
              onClick={() => setSwitcherOpen(true)}
              aria-label="Cambiar de perfil"
              style={headerIconButtonStyle}
            >
              <ChevronsUpDown size={16} />
            </button>
          )}
          {canEdit && (
            <Link to={`/actor/${actorId}/editar`} aria-label="Editar perfil" style={headerIconButtonStyle}>
              <Pencil size={16} />
            </Link>
          )}
          {isOwnPersona && (
            <Link to="/ajustes" aria-label="Ajustes" style={headerIconButtonStyle}>
              <Settings size={16} />
            </Link>
          )}
        </div>
      </header>

      <ProfileSwitcherSheet
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        profileId={user?.id}
        myActorId={myActorId}
        activeActorId={actorId}
      />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px calc(84px + env(safe-area-inset-bottom))" }}>
        {state.loading && <p style={{ color: COLORS.inkSoft, fontSize: 14 }}>Cargando…</p>}

        {state.error && (
          <p style={{ color: COLORS.inkSoft, fontSize: 14 }}>
            No pudimos encontrar este perfil. Puede que ya no esté disponible.
          </p>
        )}

        {state.data && (
          <>
            <Card style={{ marginBottom: isNegocio ? SPACE.lg : 0 }}>
              <ActorProfileHeader
                actor={state.data.actor}
                details={state.data.details}
                profile={state.data.profile}
                business={state.data.business}
              />
              {isNegocio && (
                <>
                  <ActivityStrip actorId={state.data.actor.id} businessId={state.data.business.id} />
                  <div style={{ marginTop: SPACE.sm }}>
                    <ActionBar actor={state.data.actor} business={state.data.business} />
                  </div>
                </>
              )}
            </Card>

            {isNegocio && (
              <>
                <CatalogSection businessId={state.data.business.id} />
                <EventsShelf businessId={state.data.business.id} />
                <GallerySection actorId={state.data.actor.id} />
                <GuideTeaser actorName={state.data.actor.display_name} />
                <AboutSection
                  business={state.data.business}
                  zone={state.data.zone}
                  bio={state.data.details?.bio}
                  defaultOpen
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const headerIconButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "rgba(43, 38, 34, 0.06)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: COLORS.ink,
};
