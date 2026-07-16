import { useState } from "react";
import { Heart, Send } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createAnswer, likeAnswer } from "../../lib/questions";
import { formatRelativeTime } from "../../lib/time";
import AuthGate from "../../components/ui/AuthGate";
import AuthorTag from "../social/AuthorTag";

export default function QuestionCard({ question, onUpdate }) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const answers = question.answers ?? [];

  async function submitReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    const answer = await createAnswer({
      questionId: question.id,
      text: replyText,
      authorId: user.id,
    });
    onUpdate({ ...question, answers: [...answers, answer] });
    setReplyText("");
    setShowReply(false);
  }

  async function handleLike(answer) {
    const updated = await likeAnswer(answer.id, answer.likes_count);
    onUpdate({
      ...question,
      answers: answers.map((a) => (a.id === updated.id ? updated : a)),
    });
  }

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: 16,
        marginBottom: 12,
      }}
    >
      <p style={{ fontSize: 12, color: "#E8785C", fontWeight: 600, margin: "0 0 4px" }}>
        Pregunta · {formatRelativeTime(question.created_at)}
      </p>
      <p style={{ fontSize: 15, margin: "0 0 6px" }}>{question.text}</p>
      <div style={{ marginBottom: 10 }}>
        <AuthorTag author={question.author} />
      </div>

      {answers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
          {answers.map((answer) => (
            <div
              key={answer.id}
              style={{
                background: "var(--color-bg)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div>
                <p style={{ fontSize: 14, margin: "0 0 4px" }}>
                  {answer.text}
                  {answer.verified && (
                    <span style={{ color: "#4FA383", fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
                      ✓ verificada
                    </span>
                  )}
                </p>
                <AuthorTag author={answer.author} />
              </div>
              <AuthGate prompt="Inicia sesión para dar like">
                <button
                  onClick={() => handleLike(answer)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "none",
                    border: "none",
                    color: "#6b6360",
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  <Heart size={14} />
                  {answer.likes_count}
                </button>
              </AuthGate>
            </div>
          ))}
        </div>
      )}

      {showReply ? (
        <form onSubmit={submitReply} style={{ display: "flex", gap: 8 }}>
          <input
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribe una respuesta…"
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
              background: "#E8785C",
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
      ) : (
        <AuthGate prompt="Inicia sesión para responder">
          <button
            onClick={() => setShowReply(true)}
            style={{ background: "none", border: "none", color: "#6b6360", fontSize: 13 }}
          >
            Responder
          </button>
        </AuthGate>
      )}
    </div>
  );
}
