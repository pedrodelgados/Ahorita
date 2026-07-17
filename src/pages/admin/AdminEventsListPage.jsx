import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Copy, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { listAllEventsForAdmin, createEvent, updateEvent, deleteEvent } from "../../lib/events";
import { useAuth } from "../../contexts/AuthContext";
import { CHANNELS, COLORS, EVENT_STATUSES, textStyle, TYPE, tint } from "../../styles/theme";
import { formatEventDateTime, formatRelativeTime } from "../../lib/time";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ActionsMenu from "../../components/ui/ActionsMenu";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

export default function AdminEventsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    load();
  }, [search, category, status]);

  function load() {
    listAllEventsForAdmin({ search, category, status })
      .then(setEvents)
      .catch(() => setEvents([]));
  }

  async function duplicate(event) {
    const copy = { ...event };
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    delete copy.likes_count;
    delete copy.comments_count;
    delete copy.business;
    delete copy.creator;
    const created = await createEvent({
      ...copy,
      title: `${event.title} (copia)`,
      status: "borrador",
      created_by: user.id,
    });
    navigate(`/admin/eventos/${created.id}`);
  }

  async function toggleHidden(event) {
    const next = event.status === "oculto" ? "publicado" : "oculto";
    await updateEvent(event.id, { status: next });
    load();
  }

  async function confirmDelete() {
    await deleteEvent(pendingDelete.id);
    setPendingDelete(null);
    load();
  }

  return (
    <div style={{ minHeight: "100svh" }}>
      <header style={headerStyle}>
        <button onClick={() => navigate("/admin")} style={backButtonStyle} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <h1 style={textStyle(TYPE.h1, { margin: 0, flex: 1 })}>Eventos</h1>
        <Button onClick={() => navigate("/admin/eventos/nuevo")} style={{ padding: "10px 16px", fontSize: 13.5 }}>
          <Plus size={16} /> Nuevo
        </Button>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: 20 }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: COLORS.inkSoft }} />
          <input
            placeholder="Buscar por título…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 38 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
            <option value="">Toda categoría</option>
            {CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
            <option value="">Todo estado</option>
            {EVENT_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {events === null ? (
          <p style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft })}>Cargando…</p>
        ) : events.length === 0 ? (
          <EmptyState icon={<Calendar size={22} />} title="Sin eventos" description="Ajusta los filtros o crea el primero." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {events.map((event) => {
              const statusMeta = EVENT_STATUSES.find((s) => s.id === event.status) ?? EVENT_STATUSES[1];
              const isHidden = event.status === "oculto";
              return (
                <div key={event.id} style={rowStyle}>
                  <button
                    onClick={() => navigate(`/admin/eventos/${event.id}`)}
                    style={{ display: "flex", gap: 12, flex: 1, minWidth: 0, background: "none", border: "none", textAlign: "left", padding: 0, cursor: "pointer" }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                      <ImageWithFallback
                        src={event.image_url}
                        alt={event.title}
                        category={event.category}
                        iconSize={16}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={textStyle(TYPE.h3, { margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                        {event.title}
                      </p>
                      <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: 0 })}>
                        {formatEventDateTime(event.start_at)}
                      </p>
                      <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "2px 0 0", opacity: 0.85 })}>
                        Actualizado {formatRelativeTime(event.updated_at ?? event.created_at)}
                        {event.creator?.username ? ` · por ${event.creator.username}` : ""}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 6,
                          padding: "2px 9px",
                          borderRadius: "var(--radius-full)",
                          background: tint(statusMeta.color, 0.15),
                          color: statusMeta.color,
                          ...textStyle(TYPE.label, { fontSize: 10.5 }),
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </button>
                  <ActionsMenu
                    actions={[
                      { label: "Editar", icon: <Pencil size={15} />, onClick: () => navigate(`/admin/eventos/${event.id}`) },
                      { label: "Duplicar", icon: <Copy size={15} />, onClick: () => duplicate(event) },
                      {
                        label: isHidden ? "Publicar" : "Ocultar",
                        icon: isHidden ? <Eye size={15} /> : <EyeOff size={15} />,
                        onClick: () => toggleHidden(event),
                      },
                      { label: "Eliminar", icon: <Trash2 size={15} />, onClick: () => setPendingDelete(event), danger: true },
                    ]}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ConfirmationModal
        open={!!pendingDelete}
        title="Eliminar evento"
        message={`Esta acción no se puede deshacer. "${pendingDelete?.title}" se eliminará permanentemente.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
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

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-full)",
  padding: "11px 14px",
  fontSize: 14,
  background: "#FFFFFF",
  boxSizing: "border-box",
};

const selectStyle = {
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-full)",
  padding: "8px 14px",
  fontSize: 13.5,
  background: "#FFFFFF",
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "#FFFFFF",
  borderRadius: "var(--radius-card)",
  boxShadow: "var(--shadow-card)",
  padding: 12,
};
