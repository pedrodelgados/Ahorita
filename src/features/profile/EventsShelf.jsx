import { useEffect, useState } from "react";
import { listBusinessEvents } from "../../lib/events";
import { formatEventDateTime } from "../../lib/time";
import { COLORS, SPACE, textStyle, TYPE, tint } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import EventSheet from "../events/EventSheet";

// Eventos asociados a este negocio (Fase 3, Bloque C, Entrega 2). Sin
// eventos próximos, la sección no se monta.
export default function EventsShelf({ businessId }) {
  const [events, setEvents] = useState(null);
  const [openEventId, setOpenEventId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listBusinessEvents(businessId)
      .then((e) => {
        if (!cancelled) setEvents(e);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  if (!events || events.length === 0) return null;

  return (
    <div style={{ marginBottom: SPACE.lg }}>
      <h3 style={textStyle(TYPE.h3, { margin: `0 0 ${SPACE.sm}px` })}>Eventos aquí</h3>
      <div style={{ display: "flex", gap: SPACE.sm, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 2 }}>
        {events.map((ev) => (
          <button
            key={ev.id}
            onClick={() => setOpenEventId(ev.id)}
            style={{
              flexShrink: 0, width: 168, scrollSnapAlign: "start", textAlign: "left",
              background: COLORS.surface, borderRadius: "var(--radius-sm)", overflow: "hidden",
              boxShadow: "var(--shadow-card)", border: "none", padding: 0,
            }}
          >
            <div style={{ height: 84, background: tint(COLORS.success, 0.25) }}>
              {ev.image_url && (
                <ImageWithFallback src={ev.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <div style={{ padding: "8px 10px 10px" }}>
              <p style={textStyle(TYPE.bodySmall, { fontWeight: 600, margin: "0 0 2px", lineHeight: 1.25 })}>{ev.title}</p>
              <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: 0 })}>{formatEventDateTime(ev.start_at)}</p>
            </div>
          </button>
        ))}
      </div>

      <EventSheet eventId={openEventId} onClose={() => setOpenEventId(null)} />
    </div>
  );
}
