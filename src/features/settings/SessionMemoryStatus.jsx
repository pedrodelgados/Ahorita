import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConversationStatus } from "../../lib/aiGuide";
import { formatRelativeTime } from "../../lib/time";
import Card from "../../components/ui/Card";

// Fase 7, Bloque 5: resumen de estado de la Memoria de Sesión en Ajustes --
// puramente informativo (principio de separación entre transparencia y
// funcionamiento: mirar este resumen nunca borra ni modifica nada). La
// acción de borrar la conversación permanece exclusivamente en el chat
// (GuideChat.jsx), sin mover.
//
// "Continuar conversación" reutiliza el mecanismo oficial mediante el cual
// la aplicación ya abre la conversación activa (GuideChat ya rehidrata la
// conversación persistida del servidor en cuanto se monta, sin importar en
// qué página) -- hoy ese mecanismo vive en la cápsula de la Guía IA de
// Inicio, así que el enlace navega ahí; si su ubicación visual cambia en el
// futuro, solo este destino necesita actualizarse.
export default function SessionMemoryStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversationStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const active = status?.event === "continuada";

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Conversación con la Guía IA</p>
      <Card style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14 }}>
            {active ? "Tienes una conversación activa" : "No tienes ninguna conversación activa"}
          </p>
          {active && status.startedAt && (
            <p style={{ fontSize: 12, color: "#948A80", marginTop: 2 }}>
              Iniciada {formatRelativeTime(status.startedAt)}
            </p>
          )}
        </div>
        {active && (
          <Link to="/" style={{ fontSize: 13, fontWeight: 600, color: "#4FA383", flexShrink: 0 }}>
            Continuar
          </Link>
        )}
      </Card>
    </div>
  );
}
