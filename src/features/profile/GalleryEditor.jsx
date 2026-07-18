import { useRef, useState } from "react";
import { ArrowUp, ArrowDown, Trash2, ImagePlus } from "lucide-react";
import { uploadMedia } from "../../lib/storage";
import { validateImageFile } from "../../lib/uploadValidation";
import { addActorMedia, deleteActorMedia, swapActorMediaOrder, MAX_GALLERY_ITEMS } from "../../lib/actorMedia";
import { COLORS, SPACE, textStyle, TYPE, tint } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

// Galería principal editable (Fase 3, Bloque C, Entrega 3): carga múltiple,
// reordenamiento con flechas (sin arrastrar y soltar, para no agregar una
// dependencia nueva), eliminación. Límite de cantidad como decisión de
// producto (MAX_GALLERY_ITEMS) — una galería curada, no un álbum sin fin.
export default function GalleryEditor({ actorId, media, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFiles(e) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    e.target.value = "";

    const room = MAX_GALLERY_ITEMS - media.length;
    if (room <= 0) {
      setError(`Ya tienes el máximo de ${MAX_GALLERY_ITEMS} fotos en la galería.`);
      return;
    }
    const toUpload = files.slice(0, room);
    if (files.length > toUpload.length) {
      setError(`Solo se agregaron ${toUpload.length} — el máximo de la galería es ${MAX_GALLERY_ITEMS}.`);
    } else {
      setError(null);
    }

    for (const file of toUpload) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }
      setUploading(true);
      try {
        const url = await uploadMedia(file, actorId);
        const nextOrder = (media[media.length - 1]?.display_order ?? -1) + 1;
        const created = await addActorMedia({ actorId, mediaUrl: url, displayOrder: nextOrder });
        onChange([...media, created]);
      } catch {
        setError("No se pudo subir una de las fotos. Intenta de nuevo.");
      }
    }
    setUploading(false);
  }

  async function handleDelete(item) {
    onChange(media.filter((m) => m.id !== item.id));
    try {
      await deleteActorMedia(item.id);
    } catch {
      setError("No se pudo eliminar la foto. Intenta de nuevo.");
      onChange(media);
    }
  }

  async function handleMove(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= media.length) return;
    const a = media[index];
    const b = media[targetIndex];
    const next = [...media];
    next[index] = b;
    next[targetIndex] = a;
    onChange(next);
    try {
      await swapActorMediaOrder(a, b);
    } catch {
      setError("No se pudo reordenar la galería.");
      onChange(media);
    }
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: SPACE.xs, marginBottom: SPACE.sm }}>
        {media.map((item, index) => (
          <div key={item.id} style={{ position: "relative" }}>
            <div style={{ aspectRatio: "1", borderRadius: "var(--radius-sm)", overflow: "hidden", background: tint(COLORS.accent, 0.1) }}>
              <ImageWithFallback src={item.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div
              style={{
                position: "absolute", top: 4, right: 4, display: "flex", flexDirection: "column", gap: 4,
              }}
            >
              <MiniButton onClick={() => handleDelete(item)} label="Eliminar foto">
                <Trash2 size={13} />
              </MiniButton>
            </div>
            <div style={{ position: "absolute", bottom: 4, left: 4, display: "flex", gap: 4 }}>
              <MiniButton onClick={() => handleMove(index, -1)} disabled={index === 0} label="Mover antes">
                <ArrowUp size={13} />
              </MiniButton>
              <MiniButton onClick={() => handleMove(index, 1)} disabled={index === media.length - 1} label="Mover después">
                <ArrowDown size={13} />
              </MiniButton>
            </div>
          </div>
        ))}

        {media.length < MAX_GALLERY_ITEMS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              aspectRatio: "1", borderRadius: "var(--radius-sm)", border: `1.5px dashed ${COLORS.borderSubtle}`,
              background: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 4, color: COLORS.inkSoft,
            }}
          >
            <ImagePlus size={20} />
            <span style={textStyle(TYPE.metadata, { fontWeight: 600 })}>{uploading ? "Subiendo…" : "Agregar"}</span>
          </button>
        )}
      </div>

      <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: 0 })}>
        {media.length}/{MAX_GALLERY_ITEMS} fotos
      </p>

      {error && <p style={textStyle(TYPE.metadata, { color: COLORS.error, marginTop: 6 })}>{error}</p>}

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
    </div>
  );
}

function MiniButton({ children, onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 26, height: 26, borderRadius: "50%", border: "none",
        background: "rgba(43, 38, 34, 0.55)", color: "#FFFFFF",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.35 : 1,
      }}
    >
      {children}
    </button>
  );
}
