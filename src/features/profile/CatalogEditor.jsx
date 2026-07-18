import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowUp, ArrowDown, Trash2, Plus, Pencil } from "lucide-react";
import {
  listCollectionsForEditor,
  listItemsForEditor,
  createCollection,
  updateCollection,
  deleteCollection,
  moveItemsOutOfCollection,
  swapCollectionOrder,
  createItem,
  updateItem,
  deleteItem,
  swapItemOrder,
  formatItemPrice,
} from "../../lib/catalog";
import { COLORS, SPACE, textStyle, TYPE, tint } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import CatalogItemSheet from "./CatalogItemSheet";

// Editor de catálogo (Fase 3, Bloque C, Entrega 4): colecciones flexibles
// definidas por cada negocio — "Catálogo", "Colecciones" y "Elementos" son
// deliberadamente términos genéricos, nunca "menú" ni "productos", para que
// la misma pantalla sirva a un restaurante, una ferretería, un hotel o un
// servicio profesional sin rediseñarla. Cada acción (crear/editar/ocultar/
// reordenar/eliminar) escribe de inmediato — igual que la galería —, no hay
// un botón de guardado global para el catálogo.
export default function CatalogEditor({ businessId, ownerId, category }) {
  const [collections, setCollections] = useState(null);
  const [items, setItems] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sheetState, setSheetState] = useState(null); // { collectionId, item } | null

  useEffect(() => {
    Promise.all([listCollectionsForEditor(businessId), listItemsForEditor(businessId)]).then(([c, i]) => {
      setCollections(c);
      setItems(i);
    });
  }, [businessId]);

  if (!collections) return null;

  const itemsByCollection = new Map();
  for (const item of [...items].sort((a, b) => a.display_order - b.display_order)) {
    const key = item.collection_id ?? "unassigned";
    if (!itemsByCollection.has(key)) itemsByCollection.set(key, []);
    itemsByCollection.get(key).push(item);
  }
  const unassignedItems = itemsByCollection.get("unassigned") ?? [];

  async function handleCreateCollection() {
    if (!newCollectionName.trim()) return;
    setError(null);
    try {
      const created = await createCollection(businessId, {
        name: newCollectionName.trim(),
        displayOrder: collections.length,
      });
      setCollections((prev) => [...prev, created]);
      setNewCollectionName("");
    } catch {
      setError("No se pudo crear la colección.");
    }
  }

  async function handleToggleCollectionVisible(collection) {
    const nextVisible = !collection.is_visible;
    setCollections((prev) => prev.map((c) => (c.id === collection.id ? { ...c, is_visible: nextVisible } : c)));
    try {
      await updateCollection(collection.id, { is_visible: nextVisible });
    } catch {
      setError("No se pudo actualizar la colección.");
      setCollections((prev) => prev.map((c) => (c.id === collection.id ? collection : c)));
    }
  }

  async function handleRenameCollection(collection, name) {
    setCollections((prev) => prev.map((c) => (c.id === collection.id ? { ...c, name } : c)));
    try {
      await updateCollection(collection.id, { name });
    } catch {
      setError("No se pudo renombrar la colección.");
    }
  }

  async function handleMoveCollection(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= collections.length) return;
    const a = collections[index];
    const b = collections[targetIndex];
    const next = [...collections];
    next[index] = b;
    next[targetIndex] = a;
    setCollections(next);
    try {
      await swapCollectionOrder(a, b);
    } catch {
      setError("No se pudo reordenar.");
    }
  }

  function requestDeleteCollection(collection) {
    const count = (itemsByCollection.get(collection.id) ?? []).length;
    setDeleteTarget({ collection, count });
  }

  async function confirmDeleteCollection() {
    const { collection, count } = deleteTarget;
    setDeleteTarget(null);
    try {
      if (count > 0) await moveItemsOutOfCollection(collection.id);
      await deleteCollection(collection.id);
      setCollections((prev) => prev.filter((c) => c.id !== collection.id));
      setItems((prev) => prev.map((i) => (i.collection_id === collection.id ? { ...i, collection_id: null } : i)));
    } catch {
      setError("No se pudo eliminar la colección.");
    }
  }

  async function handleSaveItem(payload) {
    const { collectionId, item } = sheetState;
    if (item) {
      const updated = await updateItem(item.id, payload);
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } else {
      const displayOrder = (itemsByCollection.get(collectionId ?? "unassigned") ?? []).length;
      const created = await createItem(businessId, { ...payload, display_order: displayOrder });
      setItems((prev) => [...prev, created]);
    }
    setSheetState(null);
  }

  async function handleDeleteItem(item) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      await deleteItem(item.id);
    } catch {
      setError("No se pudo eliminar el elemento.");
    }
  }

  async function handleMoveItem(list, index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const a = list[index];
    const b = list[targetIndex];
    setItems((prev) => prev.map((i) => (i.id === a.id ? { ...i, display_order: b.display_order } : i.id === b.id ? { ...i, display_order: a.display_order } : i)));
    try {
      await swapItemOrder(a, b);
    } catch {
      setError("No se pudo reordenar el elemento.");
    }
  }

  function renderItemRow(item, list, index) {
    return (
      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: `1px solid ${COLORS.borderSubtle}` }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: tint(COLORS.accent, 0.1) }}>
          {item.image_url && <ImageWithFallback src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={textStyle(TYPE.bodySmall, { fontWeight: 600, margin: 0 })}>
            {item.name}
            {!item.is_visible && <span style={{ color: COLORS.inkSoft, fontWeight: 500 }}> · Oculto</span>}
          </p>
          <p style={textStyle(TYPE.metadata, { color: COLORS.accent, fontWeight: 700, margin: 0 })}>
            {formatItemPrice(item)}
            {item.availability !== "disponible" && <span style={{ color: COLORS.inkSoft, fontWeight: 500 }}> · {item.availability === "agotado" ? "Agotado" : "De temporada"}</span>}
          </p>
        </div>
        <button onClick={() => handleMoveItem(list, index, -1)} disabled={index === 0} aria-label="Mover antes" style={miniIconStyle}><ArrowUp size={13} /></button>
        <button onClick={() => handleMoveItem(list, index, 1)} disabled={index === list.length - 1} aria-label="Mover después" style={miniIconStyle}><ArrowDown size={13} /></button>
        <button onClick={() => setSheetState({ collectionId: item.collection_id, item })} aria-label="Editar" style={miniIconStyle}><Pencil size={13} /></button>
        <button onClick={() => handleDeleteItem(item)} aria-label="Eliminar" style={{ ...miniIconStyle, color: COLORS.error }}><Trash2 size={13} /></button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={textStyle(TYPE.h3, { margin: `0 0 ${SPACE.sm}px` })}>Catálogo</h3>
      <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: `0 0 ${SPACE.md}px` })}>
        Organiza tu catálogo en colecciones — platos, servicios, habitaciones, productos, lo que tenga sentido para tu negocio.
      </p>

      {collections.length === 0 && unassignedItems.length === 0 && (
        <p style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft, marginBottom: SPACE.md })}>
          Todavía no tienes ninguna colección. Crea la primera abajo.
        </p>
      )}

      {collections.map((collection, index) => {
        const collectionItems = itemsByCollection.get(collection.id) ?? [];
        return (
          <div key={collection.id} style={{ marginBottom: SPACE.md, padding: SPACE.sm, background: COLORS.borderSubtle, borderRadius: "var(--radius-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <input
                value={collection.name}
                onChange={(e) => handleRenameCollection(collection, e.target.value)}
                style={{ ...collectionNameInputStyle, opacity: collection.is_visible ? 1 : 0.5 }}
              />
              <button onClick={() => handleMoveCollection(index, -1)} disabled={index === 0} aria-label="Mover antes" style={miniIconStyle}><ArrowUp size={13} /></button>
              <button onClick={() => handleMoveCollection(index, 1)} disabled={index === collections.length - 1} aria-label="Mover después" style={miniIconStyle}><ArrowDown size={13} /></button>
              <button onClick={() => handleToggleCollectionVisible(collection)} aria-label={collection.is_visible ? "Ocultar colección" : "Mostrar colección"} style={miniIconStyle}>
                {collection.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => requestDeleteCollection(collection)} aria-label="Eliminar colección" style={{ ...miniIconStyle, color: COLORS.error }}><Trash2 size={14} /></button>
            </div>

            {collectionItems.map((item, i) => renderItemRow(item, collectionItems, i))}

            <button onClick={() => setSheetState({ collectionId: collection.id, item: null })} style={addItemButtonStyle}>
              <Plus size={13} /> Agregar elemento
            </button>
          </div>
        );
      })}

      {unassignedItems.length > 0 && (
        <div style={{ marginBottom: SPACE.md, padding: SPACE.sm, background: COLORS.borderSubtle, borderRadius: "var(--radius-sm)" }}>
          <p style={textStyle(TYPE.bodySmall, { fontWeight: 700, margin: "0 0 8px" })}>Sin colección</p>
          {unassignedItems.map((item, i) => renderItemRow(item, unassignedItems, i))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: SPACE.sm }}>
        <input
          placeholder="Nombre de la nueva colección"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          style={{ ...collectionNameInputStyle, flex: 1, background: "#FFFFFF" }}
        />
        <button onClick={handleCreateCollection} style={{ ...addItemButtonStyle, width: "auto", flexShrink: 0 }}>
          <Plus size={14} /> Crear
        </button>
      </div>

      {error && <p style={textStyle(TYPE.metadata, { color: COLORS.error, marginTop: SPACE.sm })}>{error}</p>}

      {sheetState && (
        <CatalogItemSheet
          open
          item={sheetState.item}
          collections={collections}
          ownerId={ownerId}
          category={category}
          onSave={handleSaveItem}
          onClose={() => setSheetState(null)}
        />
      )}

      <ConfirmationModal
        open={!!deleteTarget}
        title="Eliminar colección"
        message={
          deleteTarget?.count > 0
            ? `Esta colección tiene ${deleteTarget.count} elemento(s). Al eliminarla, esos elementos pasarán a "Sin colección" — no se eliminan.`
            : "Esta colección no tiene elementos. ¿Eliminarla?"
        }
        confirmLabel="Eliminar colección"
        onConfirm={confirmDeleteCollection}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

const collectionNameInputStyle = {
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-sm)",
  padding: "8px 10px",
  fontSize: 14,
  fontWeight: 700,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const miniIconStyle = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: "none",
  background: "none",
  color: COLORS.inkSoft,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const addItemButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "6px 12px",
  borderRadius: "var(--radius-full)",
  border: `1.5px dashed ${COLORS.borderSubtle}`,
  background: "none",
  color: COLORS.inkSoft,
  fontSize: 12.5,
  fontWeight: 700,
};
