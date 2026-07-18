import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  getPublicActorProfile,
  canEditActor,
  updateActorProfileDetails,
  listActorMedia,
} from "../lib/actorProfile";
import { COLORS, SPACE, textStyle, TYPE } from "../styles/theme";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FormSection from "../components/ui/FormSection";
import MediaUploader from "../components/ui/MediaUploader";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import SaveStatusPill from "../components/ui/SaveStatusPill";
import ActorProfileHeader from "../features/profile/ActorProfileHeader";
import GalleryEditor from "../features/profile/GalleryEditor";
import HoursEditor from "../features/profile/HoursEditor";
import SpecialHoursEditor from "../features/profile/SpecialHoursEditor";
import CatalogEditor from "../features/profile/CatalogEditor";
import BusinessOpenStatus from "../features/profile/BusinessOpenStatus";

function snapshotOf(form) {
  return JSON.stringify(form);
}

// Edición del perfil (Fase 3, Bloque C, Entrega 3): logo, portada y bio se
// guardan juntos con el botón "Guardar cambios" (protección frente a
// cambios sin guardar, como cualquier editor admin del sistema). La galería
// es distinta a propósito: cada acción (subir/reordenar/eliminar) escribe
// de inmediato — no tiene sentido "deshacer" una subida ya hecha esperando
// a un guardado global, igual que cualquier gestor de fotos real.
export default function ActorEditPage() {
  const { actorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [access, setAccess] = useState({ loading: true, allowed: false });
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [media, setMedia] = useState([]);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [hoursDirty, setHoursDirty] = useState(false);
  const savedStatusTimeout = useRef(null);

  useEffect(() => {
    let cancelled = false;
    canEditActor(actorId)
      .then((allowed) => {
        if (cancelled) return;
        setAccess({ loading: false, allowed });
        if (!allowed) return;
        return Promise.all([getPublicActorProfile(actorId), listActorMedia(actorId)]).then(
          ([profileData, mediaData]) => {
            if (cancelled) return;
            const loadedForm = {
              bio: profileData.details?.bio ?? "",
              logo_url: profileData.details?.logo_url ?? null,
              cover_image_url: profileData.details?.cover_image_url ?? null,
            };
            setData(profileData);
            setForm(loadedForm);
            setSavedSnapshot(snapshotOf(loadedForm));
            setMedia(mediaData);
          }
        );
      })
      .catch(() => {
        if (!cancelled) setAccess({ loading: false, allowed: false });
      });
    return () => {
      cancelled = true;
    };
  }, [actorId]);

  useEffect(() => () => clearTimeout(savedStatusTimeout.current), []);

  const profileDirty = savedSnapshot !== null && form && snapshotOf(form) !== savedSnapshot;
  const dirty = profileDirty || hoursDirty;

  const handleBlockedBack = useCallback(() => setConfirmLeave(true), []);
  useUnsavedChangesGuard(dirty, handleBlockedBack);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveStatus(null);
  }

  function goToProfile() {
    navigate(`/actor/${actorId}`);
  }

  function handleBack() {
    if (dirty) setConfirmLeave(true);
    else goToProfile();
  }

  async function handleSave() {
    setSaveStatus("saving");
    try {
      await updateActorProfileDetails(actorId, {
        bio: form.bio.trim() || null,
        logo_url: form.logo_url,
        cover_image_url: form.cover_image_url,
      });
      setSavedSnapshot(snapshotOf(form));
      setSaveStatus("saved");
      clearTimeout(savedStatusTimeout.current);
      savedStatusTimeout.current = setTimeout(() => setSaveStatus(null), 2500);
    } catch {
      setSaveStatus("error");
    }
  }

  if (access.loading) return null;

  if (!access.allowed) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <p style={textStyle(TYPE.h3, { marginBottom: 8 })}>No tienes permiso para editar este perfil</p>
          <p style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft, marginBottom: 16 })}>
            Solo el propietario legal o un administrador operativo activo pueden editarlo.
          </p>
          <Button onClick={() => navigate(`/actor/${actorId}`)}>Volver al perfil</Button>
        </div>
      </div>
    );
  }

  if (!form) return null;

  const previewDetails = { ...data.details, bio: form.bio, logo_url: form.logo_url, cover_image_url: form.cover_image_url };
  const isNegocio = data.actor.type !== "persona" && !!data.business;

  return (
    <div style={{ minHeight: "100svh" }}>
      <header style={headerStyle}>
        <button onClick={handleBack} style={backButtonStyle} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <h1 style={textStyle(TYPE.h1, { margin: 0, flex: 1, fontSize: 18 })}>Editar perfil</h1>
        <SaveStatusPill status={saveStatus} dirty={dirty} />
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 100px" }}>
        <FormSection index={1} title="Logo o foto de perfil">
          <Card>
            <MediaUploader
              imageUrl={form.logo_url}
              category={data.business?.category}
              ownerId={user.id}
              aspectRatio="1 / 1"
              onChange={(url) => set("logo_url", url)}
            />
          </Card>
        </FormSection>

        <FormSection index={2} title="Portada">
          <Card>
            <MediaUploader
              imageUrl={form.cover_image_url}
              category={data.business?.category}
              ownerId={user.id}
              aspectRatio="21 / 9"
              onChange={(url) => set("cover_image_url", url)}
            />
          </Card>
        </FormSection>

        <FormSection index={3} title="Biografía">
          <Card>
            <textarea
              placeholder="Cuéntale a la gente qué hace este negocio…"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={4}
              style={textareaStyle}
            />
          </Card>
        </FormSection>

        <FormSection index={4} title="Galería principal">
          <Card>
            <GalleryEditor actorId={actorId} media={media} onChange={setMedia} />
          </Card>
        </FormSection>

        {isNegocio && (
          <FormSection index={5} title="Horarios">
            <Card style={{ marginBottom: SPACE.sm, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, fontWeight: 700 })}>Estado actual:</span>
              <BusinessOpenStatus businessId={data.business.id} />
            </Card>
            <Card style={{ marginBottom: SPACE.sm }}>
              <HoursEditor businessId={data.business.id} onDirtyChange={setHoursDirty} />
            </Card>
            <Card>
              <SpecialHoursEditor businessId={data.business.id} />
            </Card>
          </FormSection>
        )}

        {isNegocio && (
          <FormSection index={6} title="Catálogo">
            <Card>
              <CatalogEditor businessId={data.business.id} ownerId={user.id} category={data.business.category} />
            </Card>
          </FormSection>
        )}

        <FormSection index={isNegocio ? 7 : 5} title="Vista previa">
          <Card>
            <ActorProfileHeader actor={data.actor} details={previewDetails} profile={data.profile} business={data.business} />
          </Card>
        </FormSection>
      </main>

      <div style={footerStyle}>
        <Button fullWidth disabled={saveStatus === "saving" || !profileDirty} onClick={handleSave} style={{ padding: "14px 20px" }}>
          {saveStatus === "saving" ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>

      <ConfirmationModal
        open={confirmLeave}
        title="Cambios sin guardar"
        message="Si sales ahora perderás los cambios que no has guardado en logo, portada, biografía u horario."
        confirmLabel="Salir sin guardar"
        cancelLabel="Seguir editando"
        onConfirm={goToProfile}
        onCancel={() => setConfirmLeave(false)}
      />
    </div>
  );
}

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "16px 20px",
  borderBottom: "1px solid rgba(43, 38, 34, 0.08)",
};

const backButtonStyle = { background: "none", border: "none", display: "flex", cursor: "pointer" };

const textareaStyle = {
  width: "100%",
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: 14,
  background: "#FFFFFF",
  boxSizing: "border-box",
  resize: "vertical",
  fontFamily: "inherit",
};

const footerStyle = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  padding: "12px 20px calc(12px + env(safe-area-inset-bottom))",
  background: "rgba(251, 248, 244, 0.92)",
  backdropFilter: "blur(10px)",
  borderTop: "1px solid rgba(43, 38, 34, 0.08)",
  maxWidth: 640,
  margin: "0 auto",
};
