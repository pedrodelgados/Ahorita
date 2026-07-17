import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { askGuide } from "../../lib/aiGuide";
import { COLORS } from "../../styles/theme";

export default function GuideChat({ placeId, placeholder, suggestions = [] }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const next = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const reply = await askGuide({ messages: next, placeId });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "No pude responder ahorita. Intenta de nuevo en un momento.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {messages.length === 0 && (
        <div style={{ marginBottom: 14 }}>
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#948A80",
              marginBottom: 10,
            }}
          >
            <Sparkles size={14} color={COLORS.aiAccent} />
            Pregúntame lo que quieras
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  border: "1px solid rgba(43, 38, 34, 0.15)",
                  background: "#FFFFFF",
                  borderRadius: "var(--radius-full)",
                  padding: "6px 12px",
                  fontSize: 13,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 14,
            maxHeight: 340,
            overflowY: "auto",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? COLORS.aiAccent : "#FFFFFF",
                color: m.role === "user" ? "#FFFFFF" : COLORS.ink,
                padding: "10px 14px",
                borderRadius: 14,
                maxWidth: "80%",
                fontSize: 14,
                boxShadow: m.role === "user" ? "none" : "var(--shadow-card)",
              }}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <p style={{ alignSelf: "flex-start", color: "#948A80", fontSize: 13 }}>
              Pensando…
            </p>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder ?? "Escribe tu pregunta…"}
          style={{
            flex: 1,
            border: "1px solid rgba(43, 38, 34, 0.15)",
            borderRadius: "var(--radius-full)",
            padding: "10px 16px",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: COLORS.aiAccent,
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Send size={16} color="#FFFFFF" />
        </button>
      </form>
    </div>
  );
}
