import { useEffect, useState } from "react";
import { Send, Bookmark } from "lucide-react";
import { getEvent, listEventComments, createEventComment } from "../../lib/events";
import { useAuth } from "../../contexts/AuthContext";
import { useSavedEvents } from "../../contexts/SavedEventsContext";
import { CHANNELS, COLORS } from "../../styles/theme";
import { formatEventDateTime, formatRelativeTime } from "../../lib/time";
import BottomSheet from "../../components/layout/BottomSheet";
import AuthGate from "../../components/ui/AuthGate";
import AuthorTag from "../social/AuthorTag";
import DirectionsSection from "../places/DirectionsSection";

export default function EventSheet({ eventId, onClose }) {
  const { user } = useAuth();
  const { savedIds, toggleSave } = useSavedEvents();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    Promise.all([getEvent(eventId), listEventComments(eventId)])
      .then(([ev, cmts]) => {
        setEvent(ev);
        setComments(cmts);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  async function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const comment = await createEventComment({ eventId, text: commentText, authorId: user.id });
    setComments((prev) => [comment, ...prev]);
    setCommentText("");
  }

  const channel = event && CHANNELS.find((c) => c.id === event.category);
  const isSaved = event && savedIds.has(event.id);
  const isPaid = event && event.price != null && Number(event.price) > 0;

  return (
    <BottomSheet open={!!eventId} onClose={onClose}>
      {event && (
        <div>
          <img
            src={event.image_url}
            alt=""
            style={{
              width: "100%",
              height: 180,
              objectFit: "cover",
              borderRadius: "var(--radius-card)",
              marginBottom: 14,
            }}
          />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <h2 style={{ fontSize: 19, paddingRight: 24 }}>{event.title}</h2>
            <button
              onClick={() => toggleSave(event.id)}
              style={{
                background: "rgba(43, 38, 34, 0.06)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Bookmark size={16} fill={isSaved ? COLORS.accent : "none"} color={isSaved ? COLORS.accent : COLORS.ink} />
            </button>
          </div>

          <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "4px 0 2px" }}>
            {formatEventDateTime(event.start_at)}
            {channel && ` · ${channel.label}`}
          </p>
          {event.location_name && (
            <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "0 0 10px" }}>{event.location_name}</p>
          )}

          <p style={{ fontSize: 14, fontWeight: 700, color: isPaid ? COLORS.ink : "#4FA383", marginBottom: 10 }}>
            {isPaid ? `$${event.price}` : "Gratis"}
          </p>

          {event.description && (
            <p style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{event.description}</p>
          )}

          {isPaid && event.ticket_url && (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                padding: "9px 18px",
                borderRadius: "var(--radius-full)",
                background: COLORS.accent,
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                marginBottom: 20,
              }}
            >
              Comprar entradas
            </a>
          )}

          <DirectionsSection place={{ lat: event.lat, lng: event.lng, name: event.title, area: event.location_name }} />

          <h3 style={{ fontSize: 15, marginBottom: 10 }}>Comentarios</h3>

          <AuthGate prompt="Inicia sesión para comentar">
            <form onSubmit={submitComment} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario…"
                style={{
                  flex: 1,
                  border: "1px solid rgba(43, 38, 34, 0.12)",
                  borderRadius: "var(--radius-full)",
                  padding: "8px 14px",
                  fontSize: 14,
                }}
              />
              <button
                type="submit"
                style={{
                  background: COLORS.accent,
                  border: "none",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Send size={15} color="#FFFFFF" />
              </button>
            </form>
          </AuthGate>

          {!loading && comments.length === 0 && (
            <p style={{ color: COLORS.inkSoft, fontSize: 14 }}>Sé el primero en comentar.</p>
          )}

          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: "#FFFFFF",
                borderRadius: "var(--radius-sm)",
                padding: "10px 12px",
                marginBottom: 8,
                boxShadow: "var(--shadow-card)",
              }}
            >
              <p style={{ fontSize: 14, margin: "0 0 6px" }}>{comment.text}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <AuthorTag author={comment.author} />
                <span style={{ fontSize: 11, color: COLORS.inkSoft }}>
                  {formatRelativeTime(comment.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
