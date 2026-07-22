import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createEvent, deleteEvent, getEvent, updateEvent } from "../../lib/events";
import { getEventEditorialSelection, setEventEditorialSelection } from "../../lib/editorial";
import { CHANNELS, textStyle, TYPE, COLORS } from "../../styles/theme";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import FeedCard from "../../features/feed/FeedCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import FormSection from "../../components/ui/FormSection";
import MediaUploader from "../../components/ui/MediaUploader";
import LocationPicker from "../../components/ui/LocationPicker";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import SaveStatusPill from "../../components/ui/SaveStatusPill";

const EVENT_TAGS = [
  { id: "", label: "Sin etiqueta" },
  { id: "nuevo", label: "Nuevo" },
  { id: "gratis", label: "Gratis" },
  { id: "hoy", label: "Hoy" },
  { id: "imperdible", label: "Imperdible" },
  { id: "promocion", label: "Promoción" },
];

const STATUS_OPTIONS = [
  { id: "borrador", label: "Borrador" },
  { id: "publicado", label: "Publicado" },
  { id: "oculto", label: "Oculto" },
  { id: "finalizado", label: "Finalizado" },
  { id: "cancelado", label: "Cancelado" },
];

const emptyForm = {
  title: "",
  description: "",
  category: CHANNELS[0].id,
  image_url: "",
  location_name: "",
  lat: null,
  lng: null,
  start_at: "",
  end_at: "",
  price: "",
  ticket_url: "",
  organizer: "",
  tag: "",
  editorialSelected: false,
  status: "publicado",
  publish_at: "",
  expires_at: "",
};

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function snapshotOf(form, isFree) {
  return JSON.stringify({ form, isFree });
}

export default function AdminEventEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [savedSnapshot, setSavedSnapshot] = useState(isNew ? snapshotOf(emptyForm, true) : null);
  const savedStatusTimeout = useRef(null);

  useEffect(() => {
    if (isNew) return;
    Promise.all([getEvent(id), getEventEditorialSelection(id)]).then(([event, editorialSelection]) => {
      const loadedForm = {
        ...emptyForm,
        ...event,
        start_at: toLocalInput(event.start_at),
        end_at: toLocalInput(event.end_at),
        publish_at: toLocalInput(event.publish_at),
        expires_at: toLocalInput(event.expires_at),
        price: event.price ?? "",
        organizer: event.organizer ?? "",
        editorialSelected: editorialSelection.selected,
      };
      const loadedIsFree = !event.price || Number(event.price) === 0;
      setForm(loadedForm);
      setIsFree(loadedIsFree);
      setSavedSnapshot(snapshotOf(loadedForm, loadedIsFree));
      setLoading(false);
    });
  }, [id, isNew]);

  const dirty = savedSnapshot !== null && snapshotOf(form, isFree) !== savedSnapshot;

  const handleBlockedBack = useCallback(() => setConfirmLeave(true), []);
  useUnsavedChangesGuard(dirty, handleBlockedBack);

  useEffect(() => () => clearTimeout(savedStatusTimeout.current), []);

  // Cualquier edición limpia un "guardado"/"error" previo — el usuario ya
  // volvió a tocar el formulario, así que ese estado quedó obsoleto y debe
  // ceder el paso a "cambios sin guardar" (ver SaveStatusPill).
  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveStatus(null);
  }

  function setLocation(lat, lng) {
    setForm((prev) => ({ ...prev, lat, lng }));
    setSaveStatus(null);
  }

  function toggleFree(value) {
    setIsFree(value);
    setSaveStatus(null);
  }

  function goToList() {
    navigate("/admin/eventos");
  }

  function handleBack() {
    if (dirty) setConfirmLeave(true);
    else goToList();
  }

  async function handleSave() {
    if (!form.title.trim() || !form.start_at) return;
    setSaveStatus("saving");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        category: form.category,
        image_url: form.image_url || null,
        location_name: form.location_name?.trim() || null,
        lat: form.lat ?? null,
        lng: form.lng ?? null,
        start_at: new Date(form.start_at).toISOString(),
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
        price: isFree ? null : form.price ? Number(form.price) : null,
        ticket_url: form.ticket_url?.trim() || null,
        organizer: form.organizer?.trim() || null,
        tag: form.tag || null,
        status: form.status,
        publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      if (isNew) {
        const created = await createEvent({ ...payload, created_by: user.id });
        await setEventEditorialSelection(created.id, form.editorialSelected);
        setSavedSnapshot(snapshotOf(form, isFree));
        setSaveStatus("saved");
        clearTimeout(savedStatusTimeout.current);
        savedStatusTimeout.current = setTimeout(() => setSaveStatus(null), 2500);
        navigate(`/admin/eventos/${created.id}`, { replace: true });
      } else {
        await updateEvent(id, payload);
        await setEventEditorialSelection(id, form.editorialSelected);
        setSavedSnapshot(snapshotOf(form, isFree));
        setSaveStatus("saved");
        clearTimeout(savedStatusTimeout.current);
        savedStatusTimeout.current = setTimeout(() => setSaveStatus(null), 2500);
      }
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleDelete() {
    await deleteEvent(id);
    goToList();
  }

  if (loading) return null;

  const previewItem = {
    id: `preview-${id ?? "nuevo"}`,
    eventId: id ?? "preview",
    channel: form.category,
    variant: "normal",
    image: form.image_url,
    mediaType: "image",
    mediaUrl: form.image_url,
    title: form.title || "Título del evento",
    location: form.location_name,
    startAt: form.start_at ? new Date(form.start_at).toISOString() : new Date().toISOString(),
    description: form.description,
    tag: form.tag ? EVENT_TAGS.find((t) => t.id === form.tag)?.label : null,
    price: isFree ? null : form.price,
    ticketUrl: form.ticket_url,
    lat: form.lat,
    lng: form.lng,
    likesCount: 0,
    commentsCount: 0,
  };

  return (
    <div style={{ minHeight: "100svh" }}>
      <header style={headerStyle}>
        <button onClick={handleBack} style={backButtonStyle} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <h1 style={textStyle(TYPE.h1, { margin: 0, flex: 1 })}>{isNew ? "Nuevo evento" : "Editar evento"}</h1>
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
              placeholder="Título"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              style={inputStyle}
            />
            <textarea
              placeholder="Descripción"
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inputStyle}>
              {CHANNELS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <select value={form.tag || ""} onChange={(e) => set("tag", e.target.value)} style={inputStyle}>
              {EVENT_TAGS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </Card>
        </FormSection>

        <FormSection index={2} title="Fotografías">
          <Card>
            <MediaUploader
              imageUrl={form.image_url}
              category={form.category}
              ownerId={user.id}
              onChange={(url) => set("image_url", url)}
            />
          </Card>
        </FormSection>

        <FormSection index={3} title="Fecha y disponibilidad">
          <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>
              Inicio
              <input
                type="datetime-local"
                value={form.start_at}
                onChange={(e) => set("start_at", e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
            <label style={labelStyle}>
              Fin (opcional)
              <input
                type="datetime-local"
                value={form.end_at}
                onChange={(e) => set("end_at", e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
          </Card>
        </FormSection>

        <FormSection index={4} title="Ubicación">
          <Card>
            <input
              placeholder="Lugar (ej. Parque Calderón)"
              value={form.location_name || ""}
              onChange={(e) => set("location_name", e.target.value)}
              style={{ ...inputStyle, marginBottom: 12 }}
            />
            <LocationPicker
              lat={form.lat}
              lng={form.lng}
              onChange={setLocation}
            />
          </Card>
        </FormSection>

        <FormSection index={5} title="Entradas y contacto">
          <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={isFree} onChange={(e) => toggleFree(e.target.checked)} />
              Es gratis
            </label>
            {!isFree && (
              <input
                placeholder="Precio"
                type="number"
                step="any"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                style={inputStyle}
              />
            )}
            <input
              placeholder="URL de entradas"
              value={form.ticket_url || ""}
              onChange={(e) => set("ticket_url", e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Organizador"
              value={form.organizer || ""}
              onChange={(e) => set("organizer", e.target.value)}
              style={inputStyle}
            />
          </Card>
        </FormSection>

        <FormSection index={6} title="Publicación y visibilidad">
          <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} style={inputStyle}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.editorialSelected}
                onChange={(e) => set("editorialSelected", e.target.checked)}
              />
              Incluir en "Selección del editor"
            </label>
            <label style={labelStyle}>
              Programar publicación (opcional)
              <input
                type="datetime-local"
                value={form.publish_at}
                onChange={(e) => set("publish_at", e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
            <label style={labelStyle}>
              Fecha de expiración (opcional)
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => set("expires_at", e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
          </Card>
        </FormSection>

        <FormSection index={7} title="Vista previa">
          <div style={{ borderRadius: "var(--radius-card)", overflow: "hidden" }}>
            <FeedCard
              item={previewItem}
              liked={false}
              likeCount={0}
              isOpen={false}
              onToggleLike={() => {}}
              onOpenEvent={() => {}}
            />
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
        title="Eliminar evento"
        message="Esta acción no se puede deshacer. El evento se eliminará permanentemente."
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

const labelStyle = { fontSize: 12, color: COLORS.inkSoft, display: "block" };

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
