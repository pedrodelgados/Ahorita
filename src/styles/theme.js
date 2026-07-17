// Ahorita — constantes de diseño reutilizables (lado JS).
// Mantener sincronizado con src/styles/tokens.css.

export const COLORS = {
  bg: "#FBF8F4",
  ink: "#2B2622",
  inkSoft: "#948A80",
  accent: "#E8785C",
  accentPressed: "#D4664A",
  surface: "#FFFFFF",
  borderSubtle: "rgba(43, 38, 34, 0.08)",
  // Acento exclusivo de la Guía IA — nunca se usa para otra cosa, así se lee
  // como una capacidad especial y no como un botón más de la interfaz.
  aiAccent: "#8B7CE0",
  success: "#4FA383",
  warning: "#B8875A",
  error: "#C0392B",
};

// Escala de espaciado — usar siempre uno de estos valores, nunca números sueltos.
export const SPACE = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40, huge: 48 };

// Escala tipográfica nombrada. `font` referencia FONTS.display/body de abajo.
// `variation` activa el eje óptico (opsz) de Fraunces deliberadamente en vez
// de dejarlo automático: un opsz muy bajo (9) a tamaños grandes es la firma
// tipográfica de la marca — Fraunces se vuelve más suelta y con carácter en
// vez de leerse como "una serif elegante más". Ver ADN de marca en PROJECT.md.
export const TYPE = {
  display: {
    fontSize: 34,
    fontWeight: 600,
    lineHeight: 1.1,
    font: "display",
    letterSpacing: -0.5,
    variation: '"opsz" 9',
  },
  h1: { fontSize: 22, fontWeight: 600, lineHeight: 1.25, font: "display" },
  h2: { fontSize: 19, fontWeight: 600, lineHeight: 1.3, font: "display" },
  h3: { fontSize: 16, fontWeight: 600, lineHeight: 1.35, font: "body" },
  body: { fontSize: 15, fontWeight: 400, lineHeight: 1.5, font: "body" },
  bodySmall: { fontSize: 13.5, fontWeight: 400, lineHeight: 1.45, font: "body" },
  label: { fontSize: 12, fontWeight: 700, lineHeight: 1.2, font: "body", letterSpacing: 0.3 },
  metadata: { fontSize: 12.5, fontWeight: 500, lineHeight: 1.3, font: "body" },
  button: { fontSize: 15, fontWeight: 600, lineHeight: 1.2, font: "body" },

  // Escala editorial de titulares de tarjeta — una por variante de ritmo
  // del feed (ver getCardVariant en lib/feed.js). Deliberadamente separada
  // de h1/h2 para no afectar títulos de otras pantallas (perfil, admin...).
  cardTitleCompact: { fontSize: 18, fontWeight: 600, lineHeight: 1.2, font: "display" },
  cardTitle: {
    fontSize: 23,
    fontWeight: 600,
    lineHeight: 1.15,
    font: "display",
    letterSpacing: -0.3,
    variation: '"opsz" 9',
  },
  cardTitleFeatured: {
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 1.1,
    font: "display",
    letterSpacing: -0.4,
    variation: '"opsz" 9',
  },
  cardTitlePortada: {
    fontSize: 38,
    fontWeight: 600,
    lineHeight: 1.04,
    font: "display",
    letterSpacing: -0.6,
    variation: '"opsz" 9',
  },
  // Antetítulo editorial (dek de revista): itálica, sobre la foto, antes del
  // título. Opsz más alto que los títulos — la itálica de Fraunces gana
  // swash/carácter propio a tamaños ópticos medios, distinto del titular.
  kicker: {
    fontSize: 13.5,
    fontWeight: 500,
    lineHeight: 1.3,
    font: "display",
    fontStyle: "italic",
    variation: '"opsz" 40',
  },
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

// Convierte una entrada de TYPE en un objeto de estilo inline listo para usar:
// <h2 style={textStyle(TYPE.h2)}>...</h2>
export function textStyle(entry, overrides = {}) {
  const { font, variation, ...rest } = entry;
  return {
    ...rest,
    fontFamily: FONTS[font] ?? FONTS.body,
    ...(variation ? { fontVariationSettings: variation } : {}),
    ...overrides,
  };
}

// Tinte suave para el estado inactivo de un círculo de categoría (8-15% opacidad).
export function tint(hexColor, alpha = 0.12) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Degradado de foto "de marca": tinte cálido con la tinta de Ahorita, nunca
// negro puro — para que cada fotografía se sienta teñida por la identidad
// de la app en vez del degradado genérico de cualquier feed tipo Instagram.
export function photoOverlay({ strong = 0.8, soft = 0.06, mid = 0.26 } = {}) {
  return `linear-gradient(to top, ${tint(COLORS.ink, strong)} 0%, ${tint(COLORS.ink, soft)} 42%, ${tint(COLORS.ink, mid)} 100%)`;
}
