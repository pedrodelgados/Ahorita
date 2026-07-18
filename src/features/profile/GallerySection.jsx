import { useEffect, useState } from "react";
import { listActorMedia } from "../../lib/actorProfile";
import { COLORS, SPACE, textStyle, TYPE, tint } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import BottomSheet from "../../components/layout/BottomSheet";

// Galería (actor_media, Fase 3 Bloque A) — cuadrícula de 3 columnas al
// estilo Instagram. Sin fotos activas, la sección no se monta.
export default function GallerySection({ actorId }) {
  const [media, setMedia] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listActorMedia(actorId)
      .then((m) => {
        if (!cancelled) setMedia(m);
      })
      .catch(() => {
        if (!cancelled) setMedia([]);
      });
    return () => {
      cancelled = true;
    };
  }, [actorId]);

  if (!media || media.length === 0) return null;

  const preview = media.slice(0, 6);

  return (
    <div style={{ marginBottom: SPACE.lg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: SPACE.sm }}>
        <h3 style={textStyle(TYPE.h3, { margin: 0 })}>Galería</h3>
        {media.length > 6 && (
          <button
            onClick={() => setOpen(true)}
            style={{ background: "none", border: "none", ...textStyle(TYPE.metadata, { color: COLORS.accent, fontWeight: 700 }) }}
          >
            Ver todas ({media.length})
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }} onClick={() => setOpen(true)}>
        {preview.map((m) => (
          <div key={m.id} style={{ aspectRatio: "1", background: tint(COLORS.accent, 0.12), overflow: "hidden" }}>
            <ImageWithFallback src={m.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <h3 style={textStyle(TYPE.h3, { margin: "0 0 12px" })}>Galería completa</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {media.map((m) => (
            <div key={m.id} style={{ aspectRatio: "1", borderRadius: 8, background: tint(COLORS.accent, 0.12), overflow: "hidden" }}>
              <ImageWithFallback src={m.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
