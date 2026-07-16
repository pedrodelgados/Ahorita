import { useState } from "react";
import { ImagePlus, HelpCircle, Radio } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createQuestion } from "../../lib/questions";
import { createStatus } from "../../lib/statuses";
import Button from "../../components/ui/Button";

// Composer del muro de lugar: crear pregunta o estado (reporte en vivo).
export default function Composer({ place, onCreated }) {
  const { user } = useAuth();
  const [mode, setMode] = useState(null); // null | "question" | "status"
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setMode(null);
    setText("");
    setMediaFile(null);
  }

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() && !mediaFile) return;
    setSaving(true);

    try {
      if (mode === "question") {
        const question = await createQuestion({
          placeId: place.id,
          channel: place.channel_default,
          text,
          authorId: user.id,
        });
        onCreated({ type: "question", data: question, created_at: question.created_at });
      } else {
        const status = await createStatus({
          placeId: place.id,
          channel: place.channel_default,
          text,
          authorId: user.id,
          mediaFile,
        });
        onCreated({ type: "status", data: status, created_at: status.created_at });
      }
      reset();
    } finally {
      setSaving(false);
    }
  }

  if (!mode) {
    return (
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Button
          variant="secondary"
          style={{ flex: 1, padding: "10px 14px", fontSize: 14 }}
          icon={<HelpCircle size={16} />}
          onClick={() => setMode("question")}
        >
          Preguntar
        </Button>
        <Button
          variant="secondary"
          style={{ flex: 1, padding: "10px 14px", fontSize: 14 }}
          icon={<Radio size={16} />}
          onClick={() => setMode("status")}
        >
          Reportar algo
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: "#FFFFFF",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: 16,
        marginBottom: 20,
      }}
    >
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          mode === "question"
            ? "¿Qué quieres preguntar sobre este lugar?"
            : "¿Qué está pasando ahorita aquí?"
        }
        rows={3}
        style={{
          width: "100%",
          border: "1px solid rgba(43, 38, 34, 0.12)",
          borderRadius: "var(--radius-sm)",
          padding: 12,
          fontSize: 14,
          resize: "none",
          marginBottom: 10,
        }}
      />

      {mode === "status" && (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#6b6360",
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          <ImagePlus size={16} />
          {mediaFile ? mediaFile.name : "Agregar foto o video"}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
            style={{ display: "none" }}
          />
        </label>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <Button type="submit" disabled={saving} style={{ padding: "10px 18px", fontSize: 14 }}>
          {saving ? "Publicando…" : "Publicar"}
        </Button>
        <button
          type="button"
          onClick={reset}
          style={{ background: "none", border: "none", color: "#6b6360", fontSize: 14 }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
