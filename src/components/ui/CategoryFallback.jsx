import { CHANNEL_COLORS, COLORS, tint } from "../../styles/theme";
import { CHANNEL_ICONS } from "../../features/feed/channelIcons";

// Fallback editorial de marca: cuando no existe todavía una fotografía real
// y semánticamente coherente para un evento, mostramos esto en vez de
// forzar una foto que no corresponde a la categoría (nunca una fotografía
// engañosa). Un degradado suave con el color de la categoría + su ícono —
// se siente diseñado a propósito, no como un error de carga.
export default function CategoryFallback({ category, style, iconSize = 34 }) {
  const color = CHANNEL_COLORS[category] ?? COLORS.inkSoft;
  const Icon = CHANNEL_ICONS[category];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(160deg, ${tint(color, 0.24)}, ${tint(color, 0.46)})`,
        ...style,
      }}
    >
      {Icon && <Icon size={iconSize} color={color} strokeWidth={1.5} />}
    </div>
  );
}
