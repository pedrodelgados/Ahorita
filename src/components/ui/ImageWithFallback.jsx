import { useState } from "react";
import { ImageOff } from "lucide-react";
import { COLORS, tint } from "../../styles/theme";
import CategoryFallback from "./CategoryFallback";

// Reemplazo directo de <img>: si la URL falla o no existe, muestra un
// placeholder en vez de un ícono roto o una caja negra. Si se pasa
// `category`, el placeholder es el fallback editorial de marca de esa
// categoría (color + ícono) en vez del ícono genérico — nunca una
// fotografía que no corresponda al contenido.
export default function ImageWithFallback({ src, alt, style, iconSize = 22, category, ...props }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    if (category) {
      return <CategoryFallback category={category} style={style} iconSize={iconSize + 12} />;
    }
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: tint(COLORS.inkSoft, 0.1),
          ...style,
        }}
      >
        <ImageOff size={iconSize} color={COLORS.inkSoft} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      style={style}
      {...props}
    />
  );
}
