import { useEffect, useState } from "react";
import { getPermanentKnowledge, deletePermanentFact, deleteAllPermanentFacts } from "../../lib/aiGuide";
import Card from "../../components/ui/Card";

const CATEGORY_LABEL = {
  idioma_preferido: "Idioma preferido",
  preferencia_estilo_respuesta: "Estilo de respuesta preferido",
  restriccion_alimentaria: "Restricción alimentaria",
  necesidad_movilidad: "Necesidad de movilidad",
  necesidad_accesibilidad: "Necesidad de accesibilidad",
  dato_financiero_declarado: "Dato financiero declarado",
};

const OPERATION_LABEL = {
  guardado: "Se guardó",
  corregido: "Se corrigió",
  revocado: "Se revocó",
  borrado_individual: "Se borró",
  borrado_total: "Se borró todo",
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

// Fase 7, Bloque 3 (Conocimiento Permanente no-afinidad): única superficie
// donde una persona ve y corrige lo que la Guía IA sabe de ella de forma
// permanente. Nunca se expone el registro de auditoría crudo -- solo lo que
// pk_get_audit_summary() ya decidió que es legítimo mostrar (nunca el
// valor, que nunca se guardó ahí). Mismo estilo que AffinitySection.jsx.
export default function PermanentKnowledgeSection({ userId }) {
  const [facts, setFacts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!userId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function load() {
    setLoading(true);
    try {
      const data = await getPermanentKnowledge();
      setFacts(data.facts ?? []);
      setHistory(data.auditSummary ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(fact) {
    const key = `${fact.category}:${fact.subtype}`;
    setBusyKey(key);
    try {
      await deletePermanentFact({ category: fact.category, subtype: fact.subtype, asRevocation: false });
      await load();
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDeleteAll() {
    setBusyKey("__all__");
    try {
      await deleteAllPermanentFacts();
      await load();
    } finally {
      setBusyKey(null);
    }
  }

  if (!userId || loading) return null;

  return (
    <>
      <h2 style={{ fontSize: 16, marginBottom: 4 }}>Lo que la Guía IA recuerda de ti</h2>
      <p style={{ color: "#948A80", fontSize: 13, marginBottom: 12 }}>
        Solo lo que tú confirmaste explícitamente. Puedes corregirlo o borrarlo en cualquier momento.
      </p>

      {facts.length === 0 ? (
        <p style={{ color: "#948A80", fontSize: 14, marginBottom: 20 }}>
          Todavía no hay ningún dato permanente guardado.
        </p>
      ) : (
        <Card style={{ padding: 0, marginBottom: 12 }}>
          {facts.map((fact, index) => {
            const key = `${fact.category}:${fact.subtype}`;
            const busy = busyKey === key;
            return (
              <div
                key={key}
                style={{
                  padding: "14px 20px",
                  borderBottom: index < facts.length - 1 ? "1px solid rgba(43, 38, 34, 0.08)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>
                    {CATEGORY_LABEL[fact.category] ?? fact.category}
                  </p>
                  <p style={{ fontSize: 13 }}>{fact.value}</p>
                  <p style={{ fontSize: 12, color: "#948A80" }}>Confirmado el {formatDate(fact.confirmedAt)}</p>
                </div>
                <button
                  onClick={() => handleDelete(fact)}
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
                    flexShrink: 0,
                  }}
                >
                  Borrar
                </button>
              </div>
            );
          })}
        </Card>
      )}

      {facts.length > 0 && (
        <button
          onClick={handleDeleteAll}
          disabled={busyKey === "__all__"}
          style={{
            background: "none",
            border: "none",
            color: "#948A80",
            fontSize: 13,
            marginBottom: 20,
            opacity: busyKey === "__all__" ? 0.5 : 1,
          }}
        >
          Borrar todo lo que recuerda de ti
        </button>
      )}

      {history.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setShowHistory((v) => !v)}
            style={{ background: "none", border: "none", color: "#948A80", fontSize: 13 }}
          >
            {showHistory ? "Ocultar historial" : "Ver historial"}
          </button>
          {showHistory && (
            <Card style={{ padding: 0, marginTop: 8 }}>
              {history.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    padding: "10px 20px",
                    borderBottom: index < history.length - 1 ? "1px solid rgba(43, 38, 34, 0.08)" : "none",
                    fontSize: 13,
                    color: "#948A80",
                  }}
                >
                  {OPERATION_LABEL[entry.operation] ?? entry.operation}
                  {entry.category ? ` — ${CATEGORY_LABEL[entry.category] ?? entry.category}` : ""}
                  {" · "}
                  {formatDate(entry.occurredAt)}
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </>
  );
}
