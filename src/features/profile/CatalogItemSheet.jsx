import { useState } from "react";
import { COLORS, SPACE, textStyle, TYPE } from "../../styles/theme";
import BottomSheet from "../../components/layout/BottomSheet";
import Button from "../../components/ui/Button";
import MediaUploader from "../../components/ui/MediaUploader";

const PRICE_TYPES = [
  { id: "fijo", label: "Fijo" },
  { id: "desde", label: "Desde" },
  { id: "variable", label: "Variable" },
];

const AVAILABILITY = [
  { id: "disponible", label: "Disponible" },
  { id: "agotado", label: "Agotado" },
  { id: "temporada", label: "De temporada" },
];

function emptyForm(collectionId) {
  return {
    name: "",
    description: "",
    image_url: null,
    collection_id: collectionId ?? null,
    price_type: "fijo",
    price: "",
    currency: "USD",
    availability: "disponible",
    is_visible: true,
  };
}

// Formulario de un elemento del catálogo (Fase 3, Bloque C, Entrega 4):
// nombre/descripción/imagen/colección/precio/moneda/disponibilidad/
// visibilidad. Un Bottom Sheet, no una página aparte — mantiene la lista
// principal limpia mientras se edita, mismo patrón que EventSheet/galería.
export default function CatalogItemSheet({ open, item, collections, ownerId, category, onSave, onClose }) {
  const [form, setForm] = useState(() => (item ? { ...item, price: item.price ?? "" } : emptyForm(collections[0]?.id ?? null)));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (form.price_type !== "variable" && form.price !== "" && Number(form.price) < 0) {
      setError("El precio no puede ser negativo.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description?.trim() || null,
        image_url: form.image_url,
        collection_id: form.collection_id,
        price_type: form.price_type,
        price: form.price_type === "variable" ? null : form.price === "" ? null : Number(form.price),
        currency: form.currency || "USD",
        availability: form.availability,
        is_visible: form.is_visible,
      });
    } catch {
      setError("No se pudo guardar el elemento. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h3 style={textStyle(TYPE.h3, { margin: `0 0 ${SPACE.md}px` })}>{item ? "Editar elemento" : "Nuevo elemento"}</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <MediaUploader imageUrl={form.image_url} category={category} ownerId={ownerId} aspectRatio="1 / 1" onChange={(url) => set("image_url", url)} />

        <input placeholder="Nombre" value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} />
        <textarea placeholder="Descripción (opcional)" value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />

        <select value={form.collection_id ?? ""} onChange={(e) => set("collection_id", e.target.value || null)} style={inputStyle}>
          <option value="">Sin colección</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div>
          <p style={textStyle(TYPE.metadata, { fontWeight: 700, marginBottom: 6 })}>Precio</p>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {PRICE_TYPES.map((p) => (
              <button
                key={p.id}
                onClick={() => set("price_type", p.id)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: "var(--radius-full)", border: "none",
                  background: form.price_type === p.id ? COLORS.ink : COLORS.borderSubtle,
                  color: form.price_type === p.id ? "#FFFFFF" : COLORS.inkSoft,
                  ...textStyle(TYPE.metadata, { fontWeight: 700 }),
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          {form.price_type !== "variable" && (
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                placeholder="USD"
                value={form.currency}
                onChange={(e) => set("currency", e.target.value.toUpperCase().slice(0, 3))}
                style={{ ...inputStyle, width: 70, textAlign: "center" }}
              />
            </div>
          )}
        </div>

        <select value={form.availability} onChange={(e) => set("availability", e.target.value)} style={inputStyle}>
          {AVAILABILITY.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form.is_visible} onChange={(e) => set("is_visible", e.target.checked)} />
          <span style={textStyle(TYPE.bodySmall, {})}>Visible en el perfil público</span>
        </label>
      </div>

      {error && <p style={textStyle(TYPE.metadata, { color: COLORS.error, margin: "10px 0 0" })}>{error}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: SPACE.md }}>
        <Button variant="secondary" fullWidth onClick={onClose} style={{ padding: "12px 16px" }}>Cancelar</Button>
        <Button fullWidth disabled={saving} onClick={handleSave} style={{ padding: "12px 16px" }}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </BottomSheet>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: 14,
  background: "#FFFFFF",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
