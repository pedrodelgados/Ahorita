export function formatRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "ahorita mismo";
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;

  return new Date(dateString).toLocaleDateString("es-EC", {
    day: "numeric",
    month: "short",
  });
}

// Hora de un timestamptz en la zona horaria de Cuenca, sin importar en qué
// zona esté el navegador de quien mira la pantalla — el "abierto ahora" de
// un negocio siempre se calculó (business_open_status, Postgres) y debe
// mostrarse en hora de Cuenca, nunca en la hora local del visitante.
export function formatCuencaTime(dateString) {
  return new Date(dateString).toLocaleTimeString("es-EC", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Guayaquil",
  });
}

// Fase 4, Bloque 3: etiquetas temporales de Promoción. "Empieza hoy/mañana"
// (ventana de anticipación de 24h) y "Válido hasta…" (siempre visible junto
// a "Publicado hace…", nunca uno reemplaza al otro — ajuste de producto
// aprobado). Mismo criterio de comparación de día que formatEventDateTime.
function dayDiff(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((startOfDay(date) - startOfDay(now)) / dayMs);
}

export function formatPromotionStartLabel(dateString) {
  const diffDays = dayDiff(dateString);
  const time = new Date(dateString).toLocaleTimeString("es-EC", { hour: "numeric", minute: "2-digit" });
  return diffDays <= 0 ? `Empieza hoy · ${time}` : `Empieza mañana · ${time}`;
}

export function formatPromotionEndLabel(dateString) {
  const diffDays = dayDiff(dateString);
  const time = new Date(dateString).toLocaleTimeString("es-EC", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 0) return `Válido hasta hoy · ${time}`;
  if (diffDays === 1) return `Válido hasta mañana · ${time}`;
  const day = new Date(dateString).toLocaleDateString("es-EC", { weekday: "short", day: "numeric", month: "short" });
  return `Válido hasta ${day} · ${time}`;
}

export function formatPromotionFinishedLabel(dateString) {
  return `Finalizó ${formatRelativeTime(dateString)}`;
}

// "Hoy · 7:00 p.m.", "Mañana · 3:00 p.m.", "sáb 20 jul · 9:00 a.m."
export function formatEventDateTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / dayMs);

  const time = date.toLocaleTimeString("es-EC", { hour: "numeric", minute: "2-digit" });

  if (diffDays === 0) return `Hoy · ${time}`;
  if (diffDays === 1) return `Mañana · ${time}`;

  const day = date.toLocaleDateString("es-EC", { weekday: "short", day: "numeric", month: "short" });
  return `${day} · ${time}`;
}
