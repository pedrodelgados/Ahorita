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
