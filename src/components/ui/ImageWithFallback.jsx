import { useState } from "react";
import { ImageOff } from "lucide-react";
import { COLORS, tint } from "../../styles/theme";

// Reemplazo directo de <img>: si la URL falla o no existe, muestra un
// placeholder con tinte de marca en vez de un ícono roto o una caja negra.
export default function ImageWithFallback({ src, alt, style, iconSize = 22, ...props }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
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
