import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Backpack, Store, CalendarDays } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "../../lib/profile";
import Card from "../../components/ui/Card";

const MODES = [
  {
    id: "vivo_en_cuenca",
    label: "Vivo en Cuenca",
    description: "Descubre lo nuevo en tu ciudad",
    icon: Home,
  },
  {
    id: "visitante",
    label: "Estoy visitando",
    description: "Encuentra lo mejor mientras estás aquí",
    icon: Backpack,
  },
  {
    id: "negocio",
    label: "Tengo un negocio",
    description: "Date a conocer a locales y turistas",
    icon: Store,
  },
  {
    id: "organizador",
    label: "Organizo eventos",
    description: "Comparte lo que organizas en la ciudad",
    icon: CalendarDays,
  },
];

export default function UsageModeScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  async function choose(modeId) {
    setSaving(true);
    try {
      if (user) await updateProfile(user.id, { usage_mode: modeId });
    } finally {
      navigate("/explorar");
    }
  }

  return (
    <div style={{ minHeight: "100svh", padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <h1 style={{ fontSize: 26, marginBottom: 6, textAlign: "center" }}>
          ¿Cómo usarás Ahorita?
        </h1>
        <p style={{ color: "#6b6360", textAlign: "center", marginBottom: 28 }}>
          Así te mostramos lo más relevante primero.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {MODES.map(({ id, label, description, icon: Icon }) => (
            <Card
              key={id}
              onClick={() => !saving && choose(id)}
              style={{
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.6 : 1,
                textAlign: "left",
              }}
            >
              <Icon size={22} color="#E8785C" style={{ marginBottom: 10 }} />
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>{label}</h3>
              <p style={{ fontSize: 13, color: "#6b6360", margin: 0 }}>{description}</p>
            </Card>
          ))}
        </div>

        <button
          onClick={() => navigate("/explorar")}
          style={{
            display: "block",
            margin: "24px auto 0",
            background: "none",
            border: "none",
            color: "#6b6360",
            fontSize: 14,
            textDecoration: "underline",
          }}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
