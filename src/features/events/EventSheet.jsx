import { useEffect, useState } from "react";
import { Send, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEvent, listEventComments, createEventComment } from "../../lib/events";
import {
  getMyEventReactions,
  getEventReactionCounts,
  toggleEventInteraction,
  describeInteractionError,
} from "../../lib/interactions";
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
import EventReactionChips from "./EventReactionChips";

export default function EventSheet({ eventId, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { savedIds, toggleSave } = useSavedEvents();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState({ quieroIr: false, yaFui: false });
  const [reactionCounts, setReactionCounts] = useState({ quieroIr: 0, yaFui: 0 });
  const [reactionBusy, setReactionBusy] = useState({ quieroIr: false, yaFui: false });
  const [reactionError, setReactionError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setReactionError(null);
    Promise.all([getEvent(eventId), listEventComments(eventId), getEventReactionCounts(eventId)])
      .then(([ev, cmts, counts]) => {
        setEvent(ev);
        setComments(cmts);
        setReactionCounts(counts);
      })
      .finally(() => setLoading(false));

    if (isAuthenticated) {
      getMyEventReactions(user.id, eventId).then((r) =>
        setReactions({ quieroIr: r.quieroIr, yaFui: r.yaFui })
      );
    } else {
      setReactions({ quieroIr: false, yaFui: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, isAuthenticated]);

  function requireAuth(action) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    action();
  }

  async function toggleReaction(type, key) {
    if (reactionBusy[key]) return;
    const wasActive = reactions[key];
    setReactionBusy((prev) => ({ ...prev, [key]: true }));
    setReactionError(null);
    setReactions((prev) => ({ ...prev, [key]: !wasActive }));
    setReactionCounts((prev) => ({ ...prev, [key]: prev[key] + (wasActive ? -1 : 1) }));
    try {
      await toggleEventInteraction({ viewerProfileId: user.id, eventId, type, active: wasActive });
    } catch (err) {
      setReactions((prev) => ({ ...prev, [key]: wasActive }));
      setReactionCounts((prev) => ({ ...prev, [key]: prev[key] + (wasActive ? 1 : -1) }));
      setReactionError(describeInteractionError(err));
    } finally {
      setReactionBusy((prev) => ({ ...prev, [key]: false }));
    }
  }

  // "Finalización" de un evento = coalesce(end_at, start_at) — mismo
  // criterio que ya usa listUpcomingEvents (lib/events.js) para decidir qué
  // sigue "próximo" en el feed. Solo se bloquea la ACTIVACIÓN nueva; quitar
  // una reacción ya existente nunca se restringe por fecha.
  const startAt = event ? new Date(event.start_at).getTime() : null;
  const finishesAt = event ? new Date(event.end_at || event.start_at).getTime() : null;
  const now = Date.now();
  const yaFuiAvailable = startAt !== null && now >= startAt;
  const quieroIrAvailable = finishesAt !== null && now <= finishesAt;
  const yaFuiDisabled = !reactions.yaFui && !yaFuiAvailable;
  const quieroIrDisabled = !reactions.quieroIr && !quieroIrAvailable;

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
            category={event.category}
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

          <EventReactionChips
            quieroIr={reactions.quieroIr}
            quieroIrCount={reactionCounts.quieroIr}
            quieroIrBusy={reactionBusy.quieroIr}
            quieroIrDisabled={quieroIrDisabled}
            quieroIrUnavailableReason="Este evento ya finalizó."
            onToggleQuieroIr={() => requireAuth(() => toggleReaction("quiero_ir", "quieroIr"))}
            yaFui={reactions.yaFui}
            yaFuiCount={reactionCounts.yaFui}
            yaFuiBusy={reactionBusy.yaFui}
            yaFuiDisabled={yaFuiDisabled}
            yaFuiUnavailableReason="Disponible cuando empiece el evento."
            onToggleYaFui={() => requireAuth(() => toggleReaction("ya_fui", "yaFui"))}
          />
          {reactionError && (
            <p style={textStyle(TYPE.metadata, { color: COLORS.error, margin: `0 0 ${SPACE.sm}px` })}>
              {reactionError}
            </p>
          )}

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
