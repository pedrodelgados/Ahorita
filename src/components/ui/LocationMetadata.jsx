import { MapPin } from "lucide-react";
import { textStyle, TYPE } from "../../styles/theme";

// Fila de metadata "lugar · fecha/hora", reutilizable en tarjetas de feed,
// fichas de evento/lugar y donde más haga falta mostrar ubicación + cuándo.
export default function LocationMetadata({ location, meta, color = "#FFFFFF", iconColor, style }) {
  if (!location && !meta) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        ...textStyle(TYPE.metadata, { color, opacity: 0.92 }),
        ...style,
      }}
    >
      {location && <MapPin size={13} color={iconColor ?? color} />}
      {location}
      {meta && <span>· {meta}</span>}
    </div>
  );
}
