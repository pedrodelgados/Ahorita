import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createPlace, deletePlace, getPlace, updatePlace } from "../../lib/places";
import { CHANNELS, textStyle, TYPE, COLORS } from "../../styles/theme";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import PlaceCard from "../../features/places/PlaceCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import FormSection from "../../components/ui/FormSection";
import MediaUploader from "../../components/ui/MediaUploader";
import LocationPicker from "../../components/ui/LocationPicker";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import SaveStatusPill from "../../components/ui/SaveStatusPill";
import { useAuth } from "../../contexts/AuthContext";

const PLACE_TAGS = [
  { id: "", label: "Sin etiqueta" },
  { id: "nuevo", label: "Nuevo" },
  { id: "gratis", label: "Gratis" },
  { id: "imperdible", label: "Imperdible" },
  { id: "hoy", label: "Hoy" },
  { id: "evento", label: "Evento" },
  { id: "promocion", label: "Promoción" },
];

const STATUS_OPTIONS = [
  { id: "borrador", label: "Borrador" },
  { id: "publicado", label: "Publicado" },
  { id: "oculto", label: "Oculto" },
];

const emptyForm = {
  name: "",
  description: "",
  area: "",
  channel_default: CHANNELS[0].id,
  image_url: "",
  lat: null,
  lng: null,
  hours: "",
  website: "",
  tickets_url: "",
  menu_url: "",
  tag: "",
  status: "publicado",
};

function snapshotOf(form) {
  return JSON.stringify(form);
}

export default function AdminPlaceEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(isNew ? snapshotOf(emptyForm) : null);
  const savedStatusTimeout = useRef(null);

  useEffect(() => {
    if (isNew) return;
    getPlace(id).then((place) => {
      const loadedForm = { ...emptyForm, ...place };
      setForm(loadedForm);
      setSavedSnapshot(snapshotOf(loadedForm));
      setLoading(false);
    });
  }, [id, isNew]);

  const dirty = savedSnapshot !== null && snapshotOf(form) !== savedSnapshot;

  const handleBlockedBack = useCallback(() => setConfirmLeave(true), []);
  useUnsavedChangesGuard(dirty, handleBlockedBack);

  useEffect(() => () => clearTimeout(savedStatusTimeout.current), []);

  // Cualquier edición limpia un "guardado"/"error" previo — ver el mismo
  // patrón en AdminEventEditorPage.
  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveStatus(null);
  }

  function setLocation(lat, lng) {
    setForm((prev) => ({ ...prev, lat, lng }));
    setSaveStatus(null);
  }

  function goToList() {
    navigate("/admin/lugares");
  }

  function handleBack() {
    if (dirty) setConfirmLeave(true);
    else goToList();
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaveStatus("saving");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        area: form.area?.trim() || null,
        channel_default: form.channel_default,
        image_url: form.image_url || null,
        lat: form.lat ?? null,
        lng: form.lng ?? null,
        hours: form.hours?.trim() || null,
        website: form.website?.trim() || null,
        tickets_url: form.tickets_url?.trim() || null,
        menu_url: form.menu_url?.trim() || null,
        tag: form.tag || null,
        status: form.status,
      };
      if (isNew) {
        const created = await createPlace({ ...payload, created_by: user.id });
        setSavedSnapshot(snapshotOf(form));
        setSaveStatus("saved");
        clearTimeout(savedStatusTimeout.current);
        savedStatusTimeout.current = setTimeout(() => setSaveStatus(null), 2500);
        navigate(`/admin/lugares/${created.id}`, { replace: true });
      } else {
        await updatePlace(id, payload);
        setSavedSnapshot(snapshotOf(form));
        setSaveStatus("saved");
        clearTimeout(savedStatusTimeout.current);
        savedStatusTimeout.current = setTimeout(() => setSaveStatus(null), 2500);
      }
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleDelete() {
    await deletePlace(id);
    goToList();
  }

  if (loading) return null;

  const previewPlace = {
    id: id ?? "preview",
    name: form.name || "Nombre del lugar",
    area: form.area,
    channel_default: form.channel_default,
    image_url: form.image_url,
  };

  return (
    <div style={{ minHeight: "100svh" }}>
      <header style={headerStyle}>
        <button onClick={handleBack} style={backButtonStyle} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <h1 style={textStyle(TYPE.h1, { margin: 0, flex: 1 })}>{isNew ? "Nuevo lugar" : "Editar lugar"}</h1>
        <SaveStatusPill status={saveStatus} dirty={dirty} />
        {!isNew && (
          <button onClick={() => setConfirmDelete(true)} style={deleteButtonStyle} aria-label="Eliminar">
            <Trash2 size={18} />
          </button>
        )}
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 100px" }}>
        <FormSection index={1} title="Información principal">
          <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              style={inputStyle}
            />
            <textarea
              placeholder="Descripción"
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <input
              placeholder="Zona (ej. Centro Histórico)"
              value={form.area || ""}
              onChange={(e) => set("area", e.target.value)}
              style={inputStyle}
            />
            <select value={form.channel_default} onChange={(e) => set("channel_default", e.target.value)} style={inputStyle}>
              {CHANNELS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <select value={form.tag || ""} onChange={(e) => set("tag", e.target.value)} style={inputStyle}>
              {PLACE_TAGS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </Card>
        </FormSection>

        <FormSection index={2} title="Fotografías">
          <Card>
            <MediaUploader
              imageUrl={form.image_url}
              category={form.channel_default}
              ownerId={user.id}
              onChange={(url) => set("image_url", url)}
            />
          </Card>
        </FormSection>

        <FormSection index={3} title="Horario y disponibilidad">
          <Card>
            <input
              placeholder="Horario (ej. Lun-Dom 9:00-18:00)"
              value={form.hours || ""}
              onChange={(e) => set("hours", e.target.value)}
              style={inputStyle}
            />
          </Card>
        </FormSection>

        <FormSection index={4} title="Ubicación">
          <Card>
            <LocationPicker
              lat={form.lat}
              lng={form.lng}
              onChange={setLocation}
            />
          </Card>
        </FormSection>

        <FormSection index={5} title="Entradas y contacto">
          <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              placeholder="Sitio web"
              value={form.website || ""}
              onChange={(e) => set("website", e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="URL de entradas (opcional)"
              value={form.tickets_url || ""}
              onChange={(e) => set("tickets_url", e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="URL del menú (opcional)"
              value={form.menu_url || ""}
              onChange={(e) => set("menu_url", e.target.value)}
              style={inputStyle}
            />
          </Card>
        </FormSection>

        <FormSection index={6} title="Publicación y visibilidad">
          <Card>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} style={inputStyle}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </Card>
        </FormSection>

        <FormSection index={7} title="Vista previa">
          <div style={{ maxWidth: 280 }}>
            <PlaceCard place={previewPlace} onClick={() => {}} />
          </div>
        </FormSection>
      </main>

      <div style={footerStyle}>
        <Button fullWidth disabled={saveStatus === "saving"} onClick={handleSave} style={{ padding: "14px 20px" }}>
          {saveStatus === "saving" ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>

      <ConfirmationModal
        open={confirmDelete}
        title="Eliminar lugar"
        message="Esta acción no se puede deshacer. El lugar se eliminará permanentemente."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmationModal
        open={confirmLeave}
        title="Cambios sin guardar"
        message="Si sales ahora perderás los cambios que no has guardado."
        confirmLabel="Salir sin guardar"
        cancelLabel="Seguir editando"
        onConfirm={goToList}
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

const deleteButtonStyle = {
  background: "rgba(192, 57, 43, 0.1)",
  border: "none",
  borderRadius: "50%",
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: COLORS.error,
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: 14,
  background: "#FFFFFF",
  boxSizing: "border-box",
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
