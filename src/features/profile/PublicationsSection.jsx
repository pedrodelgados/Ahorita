import { useEffect, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";
import {
  listActorPublications,
  listPublishedActorPublications,
  canAuthorPublication,
} from "../../lib/publications";
import { formatRelativeTime } from "../../lib/time";
import { COLORS, SPACE, textStyle, TYPE, tint } from "../../styles/theme";
import EmptyState from "../../components/ui/EmptyState";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import PublicationComposerSheet from "./PublicationComposerSheet";

const STATUS_LABELS = { borrador: "Borrador", publicado: "Publicado", oculto: "Oculto" };

// Fase 4, Bloque 2: "muro" de Publicaciones del negocio dentro de su propio
// Centro del Negocio. Quien administra ve los tres estados con su etiqueta;
// un visitante solo ve lo publicado — mismo criterio que ya aplican
// eventos/lugares, ahora aplicado a este contenido nuevo.
export default function PublicationsSection({ actorId, authorName, canEdit }) {
  const [items, setItems] = useState(null);
  const [canAuthor, setCanAuthor] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  async function reload() {
    const list = canEdit ? await listActorPublications(actorId) : await listPublishedActorPublications(actorId);
    setItems(list);
  }

  useEffect(() => {
    let cancelled = false;
    reload().catch(() => {
      if (!cancelled) setItems([]);
    });
    if (canEdit) {
      canAuthorPublication(actorId)
        .then((allowed) => {
          if (!cancelled) setCanAuthor(allowed);
        })
        .catch(() => {
          if (!cancelled) setCanAuthor(false);
        });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actorId, canEdit]);

  if (items === null) return null;
  if (!canEdit && items.length === 0) return null;

  function openCreate() {
    setEditingItem(null);
    setComposerOpen(true);
  }

  function openEdit(item) {
    setOpenMenuId(null);
    setEditingItem(item);
    setComposerOpen(true);
  }

  return (
    <div style={{ marginBottom: SPACE.lg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: SPACE.sm }}>
        <h3 style={textStyle(TYPE.h3, { margin: 0 })}>Publicaciones</h3>
        {canEdit && canAuthor && (
          <button
            onClick={openCreate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              ...textStyle(TYPE.metadata, { color: COLORS.accent, fontWeight: 700 }),
            }}
          >
            <Plus size={14} /> Nueva
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Todavía no has publicado nada"
          description="Comparte una novedad real de tu negocio — no necesita fecha."
        />
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 0",
              borderBottom: `1px solid ${COLORS.borderSubtle}`,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                flexShrink: 0,
                background: tint(COLORS.accent, 0.12),
              }}
            >
              {item.imageUrl && (
                <ImageWithFallback src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={textStyle(TYPE.bodySmall, {
                  color: COLORS.ink,
                  margin: "0 0 4px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                })}
              >
                {item.body}
              </p>
              <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: 0 })}>
                {canEdit ? STATUS_LABELS[item.status] : formatRelativeTime(item.publishedAt)}
                {item.edited ? " · Editado" : ""}
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                aria-label="Más acciones"
                style={{ background: "none", border: "none", alignSelf: "flex-start", color: COLORS.inkSoft }}
              >
                <MoreVertical size={18} />
              </button>
            )}
            {openMenuId === item.id && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 40,
                  background: COLORS.surface,
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--shadow-sheet)",
                  zIndex: 5,
                  overflow: "hidden",
                }}
              >
                <button onClick={() => openEdit(item)} style={menuItemStyle}>
                  Editar
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {canEdit && (
        <PublicationComposerSheet
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          actorId={actorId}
          authorName={authorName}
          existing={editingItem}
          onSaved={reload}
        />
      )}
    </div>
  );
}

const menuItemStyle = {
  display: "block",
  width: "100%",
  padding: "10px 20px",
  background: "none",
  border: "none",
  textAlign: "left",
  whiteSpace: "nowrap",
  fontSize: 14,
  color: "#2B2622",
};
