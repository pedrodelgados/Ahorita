import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  PUBLICATION_BODY_MAX_LENGTH,
  createPublicationDraft,
  updatePublicationContent,
  setPublicationStatus,
  deletePublication,
  describePublicationError,
} from "../../lib/publications";
import { CHANNELS, COLORS, textStyle, TYPE } from "../../styles/theme";
import BottomSheet from "../../components/layout/BottomSheet";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import MediaUploader from "../../components/ui/MediaUploader";
import CategoryChip from "../../components/ui/CategoryChip";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

// Fase 4, Bloque 2: composer ligero, no un formulario administrativo —
// mismo lenguaje que EventSheet/ProfileSwitcherSheet (BottomSheet), con
// vista previa inline en vez de un asistente de varios pasos. Sirve tanto
// para crear (existing=null) como para editar una Publicación propia.
export default function PublicationComposerSheet({ open, onClose, actorId, authorName, existing, onSaved }) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [category, setCategory] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initial = {
      body: existing?.body ?? "",
      imageUrl: existing?.imageUrl ?? null,
      category: existing?.category ?? null,
    };
    setBody(initial.body);
    setImageUrl(initial.imageUrl);
    setCategory(initial.category);
    setSavedSnapshot(JSON.stringify(initial));
    setError(null);
  }, [open, existing]);

  const dirty = JSON.stringify({ body, imageUrl, category }) !== savedSnapshot;

  function requestClose() {
    if (dirty && !saving) {
      setConfirmClose(true);
      return;
    }
    onClose();
  }

  async function persistContent() {
    if (existing) {
      await updatePublicationContent(existing.id, { body, imageUrl, category });
      return existing.id;
    }
    return createPublicationDraft(actorId, { body, imageUrl, category });
  }

  async function handleSaveDraft() {
    if (saving || !body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await persistContent();
      onSaved();
      onClose();
    } catch (err) {
      setError(describePublicationError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (saving || !body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const id = await persistContent();
      await setPublicationStatus(id, "publicado");
      onSaved();
      onClose();
    } catch (err) {
      setError(describePublicationError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleHide() {
    if (!existing || saving) return;
    setSaving(true);
    setError(null);
    try {
      await setPublicationStatus(existing.id, "oculto");
      onSaved();
      onClose();
    } catch (err) {
      setError(describePublicationError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setConfirmDelete(false);
    setSaving(true);
    setError(null);
    try {
      await deletePublication(existing.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(describePublicationError(err));
      setSaving(false);
    }
  }

  const remaining = PUBLICATION_BODY_MAX_LENGTH - body.length;

  return (
    <>
      <BottomSheet open={open} onClose={requestClose} panelStyle={{ maxHeight: "90vh" }}>
        <h2 style={textStyle(TYPE.h3, { marginBottom: 4 })}>
          {existing ? "Editar publicación" : "Nueva publicación"}
        </h2>
        <p style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft, marginBottom: 16 })}>
          Cuenta algo real de tu negocio — no hace falta que tenga fecha.
        </p>

        <MediaUploader
          imageUrl={imageUrl}
          category={category}
          ownerId={user?.id}
          onChange={setImageUrl}
          aspectRatio="4 / 3"
        />

        <textarea
          value={body}
          maxLength={PUBLICATION_BODY_MAX_LENGTH}
          onChange={(e) => setBody(e.target.value)}
          placeholder="¿Qué está pasando en tu negocio hoy?"
          rows={4}
          style={{
            width: "100%",
            border: `1px solid ${COLORS.borderSubtle}`,
            borderRadius: "var(--radius-sm)",
            padding: 12,
            resize: "vertical",
            marginBottom: 4,
            ...textStyle(TYPE.body, { color: COLORS.ink }),
          }}
        />
        <p
          style={textStyle(TYPE.metadata, {
            color: remaining < 0 ? COLORS.error : COLORS.inkSoft,
            textAlign: "right",
            marginBottom: 16,
          })}
        >
          {remaining} caracteres restantes
        </p>

        <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, marginBottom: 8 })}>
          Categoría (opcional)
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {CHANNELS.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.label}
              color={c.color}
              active={category === c.id}
              onClick={() => setCategory(category === c.id ? null : c.id)}
            />
          ))}
        </div>

        {body.trim() && (
          <div style={{ marginBottom: 20 }}>
            <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, marginBottom: 8 })}>
              Así se verá en el feed
            </p>
            <div
              style={{
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
                background: "#1c1a18",
                position: "relative",
                minHeight: imageUrl ? 220 : "auto",
                padding: imageUrl ? 0 : 16,
              }}
            >
              {imageUrl && (
                <ImageWithFallback
                  src={imageUrl}
                  alt=""
                  style={{ width: "100%", height: 220, objectFit: "cover" }}
                />
              )}
              <div style={{ padding: imageUrl ? 16 : 0 }}>
                <p style={textStyle(TYPE.kicker, { color: "#FFFFFF", opacity: 0.9, margin: "0 0 4px" })}>
                  {authorName}
                </p>
                <p style={textStyle(TYPE.bodySmall, { color: "#FFFFFF", margin: 0, opacity: 0.95 })}>{body}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p style={textStyle(TYPE.bodySmall, { color: COLORS.error, marginBottom: 12 })} role="alert">
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button onClick={handlePublish} disabled={saving || !body.trim() || remaining < 0}>
            {existing?.status === "publicado" ? "Guardar cambios" : "Publicar"}
          </Button>
          {existing?.status !== "publicado" && (
            <Button variant="secondary" onClick={handleSaveDraft} disabled={saving || !body.trim() || remaining < 0}>
              Guardar borrador
            </Button>
          )}
          {existing?.status === "publicado" && (
            <Button variant="secondary" onClick={handleHide} disabled={saving}>
              Ocultar
            </Button>
          )}
          {existing && (
            <Button variant="secondary" onClick={() => setConfirmDelete(true)} disabled={saving}>
              Eliminar
            </Button>
          )}
        </div>
      </BottomSheet>

      <ConfirmationModal
        open={confirmClose}
        title="¿Descartar cambios?"
        message="Tienes cambios sin guardar. Si sales ahora, se perderán."
        confirmLabel="Descartar"
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
        onCancel={() => setConfirmClose(false)}
      />

      <ConfirmationModal
        open={confirmDelete}
        title="¿Eliminar esta publicación?"
        message="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
