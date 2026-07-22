import { useEffect, useState } from "react";
import { getAffinityProfile, applyAffinityCorrection } from "../../lib/affinity";
import { getPublicActorProfile } from "../../lib/actorProfile";
import { CHANNELS } from "../../styles/theme";
import Card from "../../components/ui/Card";

const CONFIDENCE_LABEL = {
  alto: "Confianza alta",
  medio: "Confianza media",
  bajo: "Confianza baja",
};

const STATE_LABEL = {
  activo: null,
  reiniciado_recientemente: "Restablecida recientemente",
  desconocido: "Marcada como desconocida",
};

const CORRECTIONS = [
  { id: "atenuar", label: "Reducir influencia" },
  { id: "reiniciar", label: "Restablecer aprendizaje" },
  { id: "desconocido", label: "Volver a desconocido" },
];

function channelInfo(category) {
  return CHANNELS.find((c) => c.id === category) ?? { label: category, color: "#948A80" };
}

// Fase 6, Bloque 1: única superficie donde una persona puede ver y corregir
// su propio Motor de Afinidad — nunca se expone la evidencia cruda
// (`affinity_contributions`), solo la descripción ya calculada por
// `affinity_profile()`. Ver FASE6_CONTRATO_ARQUITECTONICO.md: el perfil es
// siempre la mejor interpretación disponible, nunca una verdad definitiva,
// y por eso cada afinidad se muestra junto a sus propias acciones de
// corrección.
export default function AffinitySection({ actorId }) {
  const [rows, setRows] = useState([]);
  const [actorNames, setActorNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);
  const [openMenuKey, setOpenMenuKey] = useState(null);

  useEffect(() => {
    if (!actorId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actorId]);

  async function load() {
    setLoading(true);
    try {
      const data = await getAffinityProfile(actorId);
      const visible = data.filter((row) => !row.refined);
      setRows(visible);

      const actorRows = visible.filter((row) => row.target_kind === "actor_seguido");
      const missing = actorRows.filter((row) => !(row.followed_actor_id in actorNames));
      if (missing.length > 0) {
        const entries = await Promise.all(
          missing.map(async (row) => {
            try {
              const { actor, profile, business } = await getPublicActorProfile(row.followed_actor_id);
              const name = business?.name || profile?.username || actor?.display_name || "Cuenta";
              return [row.followed_actor_id, name];
            } catch {
              return [row.followed_actor_id, "Cuenta"];
            }
          })
        );
        setActorNames((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCorrection(row, correction) {
    const key = row.category ?? row.followed_actor_id;
    setBusyKey(key);
    setOpenMenuKey(null);
    try {
      await applyAffinityCorrection({
        category: row.category,
        followedActorId: row.followed_actor_id,
        correction,
      });
      await load();
    } finally {
      setBusyKey(null);
    }
  }

  if (!actorId || loading) return null;

  if (rows.length === 0) {
    return (
      <>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Tus afinidades</h2>
        <p style={{ color: "#948A80", fontSize: 14, marginBottom: 20 }}>
          Todavía no hay suficiente actividad para describir tus intereses. A medida que interactúes con
          Ahorita, esta sección irá reflejando lo que te interesa.
        </p>
      </>
    );
  }

  return (
    <>
      <h2 style={{ fontSize: 16, marginBottom: 4 }}>Tus afinidades</h2>
      <p style={{ color: "#948A80", fontSize: 13, marginBottom: 12 }}>
        Una descripción de lo que te interesa, nunca una etiqueta cerrada. Puedes corregirla en
        cualquier momento.
      </p>
      <Card style={{ padding: 0, marginBottom: 20 }}>
        {rows.map((row, index) => {
          const key = row.category ?? row.followed_actor_id;
          const isActor = row.target_kind === "actor_seguido";
          const info = isActor
            ? { label: actorNames[row.followed_actor_id] ?? "Cuenta", color: "#948A80" }
            : channelInfo(row.category);
          const stateLabel = STATE_LABEL[row.correction_state];
          const busy = busyKey === key;

          return (
            <div
              key={key}
              style={{
                padding: "14px 20px",
                borderBottom: index < rows.length - 1 ? "1px solid rgba(43, 38, 34, 0.08)" : "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: info.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{info.label}</p>
                <p style={{ fontSize: 12, color: "#948A80" }}>
                  {CONFIDENCE_LABEL[row.confidence]}
                  {stateLabel ? ` · ${stateLabel}` : ""}
                </p>
              </div>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setOpenMenuKey(openMenuKey === key ? null : key)}
                  disabled={busy}
                  style={{
                    background: "none",
                    border: "1px solid rgba(43, 38, 34, 0.15)",
                    borderRadius: "var(--radius-full)",
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#2B2622",
                    opacity: busy ? 0.5 : 1,
                  }}
                >
                  Corregir
                </button>
                {openMenuKey === key && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      background: "#FFFFFF",
                      borderRadius: "var(--radius-sm)",
                      boxShadow: "var(--shadow-card)",
                      overflow: "hidden",
                      zIndex: 1,
                      minWidth: 190,
                    }}
                  >
                    {CORRECTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleCorrection(row, option.id)}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 14px",
                          fontSize: 13,
                          background: "none",
                          border: "none",
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
