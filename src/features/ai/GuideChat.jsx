import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";
import {
  askGuide,
  getConversationStatus,
  importGuestConversation,
  deleteActiveConversation,
  savePermanentFact,
  getPermanentKnowledgeCatalog,
} from "../../lib/aiGuide";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS } from "../../styles/theme";

// Fase 7, Bloque 2 (Memoria de Sesión): señales de estado del pipeline,
// nunca contenido hablado por la Guía IA -- La Expresión nunca menciona su
// propia mecánica interna, esto vive únicamente en la interfaz.
const EXPIRED_NOTE = "La conversación anterior terminó por inactividad.";
const DEGRADED_NOTE = "No pude recuperar el contexto de esta conversación en este momento.";

export default function GuideChat({ placeId, placeholder, suggestions = [] }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusNote, setStatusNote] = useState(null);
  const [guestConsent, setGuestConsent] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [candidateStep, setCandidateStep] = useState("inicial");
  const [catalog, setCatalog] = useState([]);

  const previousUserId = useRef(user?.id ?? null);
  const hydratedRef = useRef(false);

  // Fase 7, Bloque 3 (Conocimiento Permanente no-afinidad): el catálogo dice
  // qué categorías exigen un segundo paso de confirmación reforzada antes de
  // guardar un candidato que propuso El Razonador. Dato de referencia
  // público, se lee una sola vez -- nunca depende de si hay sesión.
  useEffect(() => {
    getPermanentKnowledgeCatalog()
      .then(setCatalog)
      .catch(() => {
        // Degradación honesta: sin catálogo, se trata cualquier candidato
        // como si exigiera confirmación reforzada (la opción más prudente).
      });
  }, []);

  // Al abrir el chat como persona ya autenticada: recuperar la única
  // conversación activa, si sigue vigente. Nunca se dispara para un
  // invitado -- no existe ninguna persistencia server-side para él.
  useEffect(() => {
    if (!user || hydratedRef.current) return;
    hydratedRef.current = true;
    getConversationStatus()
      .then(({ event, turns }) => {
        if (event === "continuada" && turns?.length > 0) {
          setMessages(turns);
        } else if (event === "expirada") {
          setStatusNote(EXPIRED_NOTE);
        }
      })
      .catch(() => {
        // Degradación honesta: si la hidratación falla, se muestra como una
        // conversación nueva -- nunca se bloquea la apertura del chat.
      });
  }, [user]);

  // Invitado que crea una cuenta a mitad de conversación: nunca se asocia
  // automáticamente -- se pide consentimiento explícito antes de guardar
  // lo ya conversado (aprobado explícitamente por el Product Owner).
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (currentId && !previousUserId.current && messages.length > 0) {
      setGuestConsent(true);
    }
    previousUserId.current = currentId;
  }, [user, messages.length]);

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const priorMessages = messages;
    const next = [...priorMessages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      // Autenticado: el servidor ya conserva el hilo, solo se envía el
      // turno nuevo. Invitado: el cliente sigue siendo la única fuente de
      // verdad, se reenvía lo ya conversado (sin cambios respecto al
      // Bloque 1).
      const data = await askGuide({
        text: question,
        placeId,
        guestHistory: user ? undefined : priorMessages,
      });
      setMessages([...next, { role: "assistant", content: data.reply }]);

      if (data.conversation?.event === "expirada") {
        setStatusNote(EXPIRED_NOTE);
      } else if (data.conversation?.memoryDegraded) {
        setStatusNote(DEGRADED_NOTE);
      } else {
        setStatusNote(null);
      }

      // Fase 7, Bloque 3: El Razonador solo PROPONE -- nunca escribe nada.
      // Solo se muestra si hay sesión (un invitado no tiene dónde guardarlo).
      if (user && data.permanentKnowledgeCandidate) {
        setCandidate(data.permanentKnowledgeCandidate);
        setCandidateStep("inicial");
      }
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

  async function acceptGuestConsent() {
    setGuestConsent(false);
    try {
      await importGuestConversation(messages);
    } catch {
      // Un fallo aquí no debe alarmar a la persona -- la conversación sigue
      // funcionando localmente igual que antes, solo no quedó guardada.
    }
  }

  function declineGuestConsent() {
    setGuestConsent(false);
  }

  async function clearConversation() {
    setMessages([]);
    setStatusNote(null);
    if (user) {
      try {
        await deleteActiveConversation();
      } catch {
        // Degradación honesta: la vista local ya se limpió; un fallo en el
        // borrado remoto no se presenta como un error bloqueante.
      }
    }
  }

  function requiresReinforcedConfirmation(category) {
    const entry = catalog.find((c) => c.category === category);
    // Sin catálogo disponible: se asume el caso más prudente.
    return entry ? entry.requires_reinforced_confirmation : true;
  }

  function requestSaveCandidate() {
    if (!candidate) return;
    if (requiresReinforcedConfirmation(candidate.category)) {
      setCandidateStep("reforzada");
    } else {
      confirmSaveCandidate(false);
    }
  }

  async function confirmSaveCandidate(reinforcedConfirmationShown) {
    if (!candidate) return;
    const toSave = candidate;
    setCandidate(null);
    setCandidateStep("inicial");
    try {
      await savePermanentFact({
        category: toSave.category,
        subtype: toSave.subtype,
        value: toSave.suggestedValue,
        reinforcedConfirmationShown,
      });
    } catch {
      // Degradación honesta: un fallo al guardar no interrumpe la
      // conversación -- simplemente el dato no quedó guardado.
    }
  }

  function declineCandidate() {
    setCandidate(null);
    setCandidateStep("inicial");
  }

  return (
    <div>
      {statusNote && (
        <p style={{ fontSize: 12, color: "#948A80", marginBottom: 10, fontStyle: "italic" }}>{statusNote}</p>
      )}

      {guestConsent && (
        <div
          style={{
            border: `1px solid ${COLORS.aiAccent}`,
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 14,
            fontSize: 13,
          }}
        >
          <p style={{ marginBottom: 8 }}>¿Quieres guardar esta conversación en tu cuenta para continuarla después?</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={acceptGuestConsent}
              style={{
                background: COLORS.aiAccent,
                color: "#FFFFFF",
                border: "none",
                borderRadius: "var(--radius-full)",
                padding: "6px 14px",
                fontSize: 13,
              }}
            >
              Guardar
            </button>
            <button
              onClick={declineGuestConsent}
              style={{
                background: "transparent",
                border: "1px solid rgba(43, 38, 34, 0.15)",
                borderRadius: "var(--radius-full)",
                padding: "6px 14px",
                fontSize: 13,
              }}
            >
              No, gracias
            </button>
          </div>
        </div>
      )}

      {candidate && (
        <div
          style={{
            border: `1px solid ${COLORS.aiAccent}`,
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 14,
            fontSize: 13,
          }}
        >
          {candidateStep === "inicial" ? (
            <>
              <p style={{ marginBottom: 8 }}>
                {candidate.reason} ¿Quieres que recuerde esto: "{candidate.suggestedValue}"?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={requestSaveCandidate}
                  style={{
                    background: COLORS.aiAccent,
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    padding: "6px 14px",
                    fontSize: 13,
                  }}
                >
                  Guardar
                </button>
                <button
                  onClick={declineCandidate}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(43, 38, 34, 0.15)",
                    borderRadius: "var(--radius-full)",
                    padding: "6px 14px",
                    fontSize: 13,
                  }}
                >
                  No, gracias
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ marginBottom: 8 }}>
                Esto es un dato sensible. ¿Confirmas que quieres que la Guía IA lo recuerde de forma permanente: "
                {candidate.suggestedValue}"?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => confirmSaveCandidate(true)}
                  style={{
                    background: COLORS.aiAccent,
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    padding: "6px 14px",
                    fontSize: 13,
                  }}
                >
                  Sí, confirmar
                </button>
                <button
                  onClick={declineCandidate}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(43, 38, 34, 0.15)",
                    borderRadius: "var(--radius-full)",
                    padding: "6px 14px",
                    fontSize: 13,
                  }}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      )}

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
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={clearConversation}
              aria-label="Borrar esta conversación"
              title="Borrar esta conversación"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: "none",
                color: "#948A80",
                fontSize: 12,
              }}
            >
              <Trash2 size={13} />
              Borrar
            </button>
          </div>
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
