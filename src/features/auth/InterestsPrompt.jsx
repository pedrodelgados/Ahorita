import { useState } from "react";
import { CHANNELS } from "../../styles/theme";
import { updateProfile } from "../../lib/profile";
import CategoryChip from "../../components/ui/CategoryChip";
import Button from "../../components/ui/Button";

// Parte del registro progresivo: se muestra en el feed hasta que el usuario
// elige sus intereses o la descarta, en vez de pedirlo todo en el signup.
export default function InterestsPrompt({ userId, onDone }) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function save() {
    setSaving(true);
    try {
      await updateProfile(userId, { interests: selected });
    } finally {
      onDone();
    }
  }

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: 20,
        marginBottom: 24,
      }}
    >
      <h3 style={{ fontSize: 16, marginBottom: 4 }}>¿Qué te interesa?</h3>
      <p style={{ fontSize: 13, color: "#6b6360", marginBottom: 14 }}>
        Elige uno o más — puedes cambiarlo cuando quieras.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {CHANNELS.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.label}
            color={c.color}
            active={selected.includes(c.id)}
            onClick={() => toggle(c.id)}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Button
          onClick={save}
          disabled={saving || selected.length === 0}
          style={{ padding: "10px 18px", fontSize: 14 }}
        >
          Guardar
        </Button>
        <button
          onClick={onDone}
          style={{ background: "none", border: "none", color: "#6b6360", fontSize: 14 }}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
