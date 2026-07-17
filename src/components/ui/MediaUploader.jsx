import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { uploadMedia } from "../../lib/storage";
import { COLORS, textStyle, TYPE } from "../../styles/theme";
import ImageWithFallback from "./ImageWithFallback";

// Subir/reemplazar/eliminar la foto principal. Al eliminar, vuelve a null —
// ImageWithFallback ya sabe mostrar el fallback de categoría de marca en vez
// de una foto ausente (ver CategoryFallback), así que "eliminar" nunca deja
// un hueco vacío.
export default function MediaUploader({ imageUrl, category, ownerId, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadMedia(file, ownerId);
      onChange(url);
    } catch {
      setError("No se pudo subir la foto. Intenta de nuevo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          background: "#EEE",
          marginBottom: 12,
        }}
      >
        <ImageWithFallback
          src={imageUrl}
          alt=""
          category={category}
          iconSize={30}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(43, 38, 34, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              ...textStyle(TYPE.bodySmall),
            }}
          >
            Subiendo…
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={secondaryButtonStyle}
        >
          <ImagePlus size={16} />
          {imageUrl ? "Reemplazar foto" : "Subir foto"}
        </button>
        {imageUrl && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={uploading}
            style={{ ...secondaryButtonStyle, color: COLORS.error }}
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        )}
      </div>
      {error && (
        <p style={textStyle(TYPE.metadata, { color: COLORS.error, marginTop: 8 })}>{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
}

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 16px",
  borderRadius: "var(--radius-full)",
  border: "1px solid rgba(43, 38, 34, 0.15)",
  background: "#FFFFFF",
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
};
