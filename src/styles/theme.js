// Ahorita — constantes de diseño reutilizables (lado JS).
// Mantener sincronizado con src/styles/tokens.css.

export const COLORS = {
  bg: "#FBF8F4",
  ink: "#2B2622",
  inkSoft: "#948A80",
  accent: "#E8785C",
};

export const CHANNELS = [
  { id: "gastronomia", label: "Gastronomía", color: "#E8785C" },
  { id: "cultura", label: "Cultura", color: "#8B7CE0" },
  { id: "vida_nocturna", label: "Vida nocturna", color: "#E0669A" },
  { id: "deportes", label: "Deportes", color: "#4FA383" },
  { id: "naturaleza", label: "Naturaleza", color: "#4FA3A0" },
  { id: "glamping", label: "Glamping", color: "#B8875A" },
  { id: "hoteles", label: "Hoteles", color: "#5B94C9" },
  { id: "musica", label: "Música", color: "#D9A83F" },
  { id: "familiar", label: "Familiar", color: "#E0966A" },
  { id: "pet_friendly", label: "Pet friendly", color: "#7BAE8C" },
];

export const CHANNEL_COLORS = Object.fromEntries(
  CHANNELS.map((c) => [c.id, c.color])
);

export const FONTS = {
  display: "'Fraunces', Georgia, serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

// Tinte suave para el estado inactivo de un círculo de categoría (8-15% opacidad).
export function tint(hexColor, alpha = 0.12) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
