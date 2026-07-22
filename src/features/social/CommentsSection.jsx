import { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { listComments, createComment, deleteComment, describeInteractionError } from "../../lib/interactions";
import { COLORS, SPACE, textStyle, TYPE } from "../../styles/theme";
import { formatRelativeTime } from "../../lib/time";
import AuthGate from "../../components/ui/AuthGate";
import AuthorTag from "./AuthorTag";

// Fase 5B, Bloque 3: comentarios generalizados (Evento y Publicación) sobre
// `interactions`/`interaction_comments` — componente compartido para que
// ambos tipos de contenido usen exactamente la misma lógica y presentación,
// en vez de que cada uno reimplemente su propia versión (como ocurría antes
// de este bloque, cuando solo Evento tenía comentarios). `targetType` es
// 'event' o 'publicacion'; nunca 'promocion' (la base de datos ya lo
// rechaza, ver migración 0034).
export default function CommentsSection({ targetType, targetId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!targetId) return;
    let cancelled = false;
    setLoading(true);
    listComments(targetType, targetId)
      .then((cmts) => {
        if (!cancelled) setComments(cmts);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  // Estado `busy` para prevenir el doble envío mientras la solicitud está en
  // vuelo — defecto real identificado durante el análisis de este bloque
  // (el composer original de Evento no lo tenía).
  async function submitComment(e) {
    e.preventDefault();
    if (busy || !commentText.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const comment = await createComment({
        viewerProfileId: user.id,
        targetType,
        targetId,
        body: commentText.trim(),
      });
      setComments((prev) => [comment, ...prev]);
      setCommentText("");
    } catch (err) {
      setError(describeInteractionError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(commentId) {
    if (deletingId) return;
    setDeletingId(commentId);
    setError(null);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, deleted: true, body: null } : c)));
    } catch (err) {
      setError(describeInteractionError(err));
    } finally {
      setDeletingId(null);
    }
  }

  const visibleCount = comments.filter((c) => !c.deleted).length;

  return (
    <div>
      <h3 style={textStyle(TYPE.h3, { margin: `0 0 ${SPACE.md}px` })}>
        Comentarios{visibleCount > 0 ? ` (${visibleCount})` : ""}
      </h3>

      <AuthGate prompt="Inicia sesión para comentar">
        <form onSubmit={submitComment} style={{ display: "flex", gap: 8, marginBottom: SPACE.lg }}>
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe un comentario…"
            maxLength={500}
            disabled={busy}
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
            disabled={busy || !commentText.trim()}
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
              opacity: busy || !commentText.trim() ? 0.6 : 1,
            }}
          >
            <Send size={15} color="#FFFFFF" />
          </button>
        </form>
      </AuthGate>

      {error && (
        <p style={textStyle(TYPE.metadata, { color: COLORS.error, margin: `0 0 ${SPACE.sm}px` })}>{error}</p>
      )}

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
          {comment.deleted ? (
            <p style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft, fontStyle: "italic", margin: `0 0 ${SPACE.xxs}px` })}>
              Comentario eliminado
            </p>
          ) : (
            <p style={textStyle(TYPE.bodySmall, { margin: `0 0 ${SPACE.xxs}px` })}>{comment.body}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {comment.author.id ? (
              <AuthorTag author={comment.author} />
            ) : (
              <span style={{ fontSize: 12, color: COLORS.inkSoft }}>Cuenta eliminada</span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft })}>
                {formatRelativeTime(comment.created_at)}
              </span>
              {!comment.deleted && user?.id === comment.author.id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  aria-label="Eliminar comentario"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    display: "flex",
                    opacity: deletingId === comment.id ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={14} color={COLORS.inkSoft} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
