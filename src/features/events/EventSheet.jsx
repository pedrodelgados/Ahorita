import { useEffect, useState } from "react";
import { Send, Bookmark } from "lucide-react";
import { getEvent, listEventComments, createEventComment } from "../../lib/events";
import { useAuth } from "../../contexts/AuthContext";
import { useSavedEvents } from "../../contexts/SavedEventsContext";
import { CHANNELS, COLORS, SPACE, textStyle, TYPE } from "../../styles/theme";
import { formatEventDateTime, formatRelativeTime } from "../../lib/time";
import BottomSheet from "../../components/layout/BottomSheet";
import AuthGate from "../../components/ui/AuthGate";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import LocationMetadata from "../../components/ui/LocationMetadata";
import Button from "../../components/ui/Button";
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
          <ImageWithFallback
            src={event.image_url}
            alt=""
            iconSize={26}
            style={{
              width: "100%",
              height: 220,
              objectFit: "cover",
              borderRadius: "var(--radius-card)",
              marginBottom: SPACE.lg,
              // Mismo nombre que la tarjeta del feed (FeedCard) — permite que
              // la View Transitions API anime una imagen "expandiéndose"
              // hacia el detalle en vez de mostrar un panel nuevo encima.
              viewTransitionName: `ahorita-event-${event.id}`,
            }}
          />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <h2 style={textStyle(TYPE.cardTitle, { paddingRight: 24 })}>{event.title}</h2>
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

          <div style={{ margin: `${SPACE.xs}px 0 ${SPACE.md}px` }}>
            <LocationMetadata
              location={event.location_name}
              meta={formatEventDateTime(event.start_at)}
              color={COLORS.inkSoft}
              iconColor={COLORS.inkSoft}
            />
            {channel && (
              <p style={textStyle(TYPE.kicker, { color: COLORS.inkSoft, margin: "3px 0 0" })}>{channel.label}</p>
            )}
          </div>

          <p
            style={textStyle(TYPE.h3, {
              color: isPaid ? COLORS.ink : COLORS.success,
              margin: `0 0 ${SPACE.md}px`,
            })}
          >
            {isPaid ? `$${event.price}` : "Gratis"}
          </p>

          {event.description && (
            <p style={textStyle(TYPE.body, { margin: `0 0 ${SPACE.lg}px` })}>{event.description}</p>
          )}

          {isPaid && event.ticket_url && (
            <Button
              as="a"
              href={event.ticket_url}
              target="_blank"
              rel="noreferrer"
              style={{ padding: "10px 20px", fontSize: 14, marginBottom: SPACE.xl }}
            >
              Comprar entradas
            </Button>
          )}

          <DirectionsSection place={{ lat: event.lat, lng: event.lng, name: event.title, area: event.location_name }} />

          <h3 style={textStyle(TYPE.h3, { margin: `0 0 ${SPACE.md}px` })}>Comentarios</h3>

          <AuthGate prompt="Inicia sesión para comentar">
            <form onSubmit={submitComment} style={{ display: "flex", gap: 8, marginBottom: SPACE.lg }}>
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
            <p style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft })}>Sé el primero en comentar.</p>
          )}

          {comments.map((comment, i) => (
            <div
              key={comment.id}
              style={{
                padding: `${SPACE.sm}px 0`,
                borderTop: i === 0 ? "none" : "1px solid rgba(43, 38, 34, 0.08)",
              }}
            >
              <p style={textStyle(TYPE.bodySmall, { margin: `0 0 ${SPACE.xxs}px` })}>{comment.text}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <AuthorTag author={comment.author} />
                <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft })}>
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
