import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getBusinessOpenStatus } from "../../lib/actorProfile";
import { formatCuencaTime } from "../../lib/time";
import { COLORS, textStyle, TYPE } from "../../styles/theme";

// Estado operativo calculado en vivo por Postgres (business_open_status,
// Fase 3 Bloque B) — nunca se recalcula ni se aproxima en el frontend, para
// no duplicar la lógica de horarios (múltiples intervalos, turnos que
// cruzan medianoche, feriados) en dos lugares distintos.
export default function BusinessOpenStatus({ businessId }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getBusinessOpenStatus(businessId)
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  if (!status) return null;

  const nextLabel = status.is_open
    ? status.next_close_at && `Cierra a las ${formatCuencaTime(status.next_close_at)}`
    : status.next_open_at && `Abre a las ${formatCuencaTime(status.next_open_at)}`;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Clock size={13} color={status.is_open ? COLORS.success : COLORS.inkSoft} />
      <span
        style={textStyle(TYPE.metadata, {
          color: status.is_open ? COLORS.success : COLORS.error,
          fontWeight: 700,
        })}
      >
        {status.is_open ? "Abierto ahora" : "Cerrado ahora"}
      </span>
      {nextLabel && (
        <span style={textStyle(TYPE.metadata, { color: COLORS.inkSoft })}>· {nextLabel}</span>
      )}
    </span>
  );
}
