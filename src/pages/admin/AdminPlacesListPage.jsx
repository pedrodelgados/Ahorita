import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Eye, EyeOff, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { listAllPlacesForAdmin, createPlace, updatePlace, deletePlace } from "../../lib/places";
import { useAuth } from "../../contexts/AuthContext";
import { CHANNELS, COLORS, PLACE_STATUSES, textStyle, TYPE, tint } from "../../styles/theme";
import { formatRelativeTime } from "../../lib/time";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ActionsMenu from "../../components/ui/ActionsMenu";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

export default function AdminPlacesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [places, setPlaces] = useState(null);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    load();
  }, [search, channel, status]);

  function load() {
    listAllPlacesForAdmin({ search, channel, status })
      .then(setPlaces)
      .catch(() => setPlaces([]));
  }

  async function duplicate(place) {
    const copy = { ...place };
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    delete copy.creator;
    const created = await createPlace({
      ...copy,
      name: `${place.name} (copia)`,
      status: "borrador",
      created_by: user.id,
    });
    navigate(`/admin/lugares/${created.id}`);
  }

  async function toggleHidden(place) {
    const next = place.status === "oculto" ? "publicado" : "oculto";
    await updatePlace(place.id, { status: next });
    load();
  }

  async function confirmDelete() {
    await deletePlace(pendingDelete.id);
    setPendingDelete(null);
    load();
  }

  return (
    <div style={{ minHeight: "100svh" }}>
      <header style={headerStyle}>
        <button onClick={() => navigate("/admin")} style={backButtonStyle} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <h1 style={textStyle(TYPE.h1, { margin: 0, flex: 1 })}>Lugares</h1>
        <Button onClick={() => navigate("/admin/lugares/nuevo")} style={{ padding: "10px 16px", fontSize: 13.5 }}>
          <Plus size={16} /> Nuevo
        </Button>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: 20 }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: COLORS.inkSoft }} />
          <input
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 38 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <select value={channel} onChange={(e) => setChannel(e.target.value)} style={selectStyle}>
            <option value="">Toda categoría</option>
            {CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
            <option value="">Todo estado</option>
            {PLACE_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {places === null ? (
          <p style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft })}>Cargando…</p>
        ) : places.length === 0 ? (
          <EmptyState icon={<MapPin size={22} />} title="Sin lugares" description="Ajusta los filtros o crea el primero." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {places.map((place) => {
              const statusMeta = PLACE_STATUSES.find((s) => s.id === place.status) ?? PLACE_STATUSES[1];
              const isHidden = place.status === "oculto";
              return (
                <div key={place.id} style={rowStyle}>
                  <button
                    onClick={() => navigate(`/admin/lugares/${place.id}`)}
                    style={{ display: "flex", gap: 12, flex: 1, minWidth: 0, background: "none", border: "none", textAlign: "left", padding: 0, cursor: "pointer" }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                      <ImageWithFallback
                        src={place.image_url}
                        alt={place.name}
                        category={place.channel_default}
                        iconSize={16}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={textStyle(TYPE.h3, { margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                        {place.name}
                      </p>
                      <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: 0 })}>
                        {place.area || "Sin zona"}
                      </p>
                      <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "2px 0 0", opacity: 0.85 })}>
                        Actualizado {formatRelativeTime(place.updated_at ?? place.created_at)}
                        {place.creator?.username ? ` · por ${place.creator.username}` : ""}
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
                      { label: "Editar", icon: <Pencil size={15} />, onClick: () => navigate(`/admin/lugares/${place.id}`) },
                      { label: "Duplicar", icon: <Copy size={15} />, onClick: () => duplicate(place) },
                      {
                        label: isHidden ? "Publicar" : "Ocultar",
                        icon: isHidden ? <Eye size={15} /> : <EyeOff size={15} />,
                        onClick: () => toggleHidden(place),
                      },
                      { label: "Eliminar", icon: <Trash2 size={15} />, onClick: () => setPendingDelete(place), danger: true },
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
        title="Eliminar lugar"
        message={`Esta acción no se puede deshacer. "${pendingDelete?.name}" se eliminará permanentemente.`}
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
