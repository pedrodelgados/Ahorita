import { useEffect, useState } from "react";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { COLORS, textStyle, TYPE } from "../../styles/theme";

// Columna vertical de acciones sociales de una publicación (like/comentar/
// compartir/guardar). El corazón hace un pequeño rebote al pasar a "liked".
export default function SocialActions({
  liked,
  likeCount,
  commentCount,
  saved,
  onToggleLike,
  onOpenComments,
  onShare,
  onToggleSave,
}) {
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (!liked) return;
    setPop(true);
    const t = setTimeout(() => setPop(false), 350);
    return () => clearTimeout(t);
  }, [liked]);

  return (
    <div
      style={{
        position: "absolute",
        right: 12,
        bottom: 140,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <ActionButton
        icon={
          <Heart
            className={pop ? "ahorita-like-pop" : undefined}
            size={24}
            fill={liked ? COLORS.accent : "none"}
            color={liked ? COLORS.accent : "#FFFFFF"}
          />
        }
        label={likeCount > 0 ? String(likeCount) : "Me gusta"}
        onClick={onToggleLike}
      />
      <ActionButton
        icon={<MessageCircle size={24} color="#FFFFFF" />}
        label={commentCount > 0 ? String(commentCount) : "Comentar"}
        onClick={onOpenComments}
      />
      <ActionButton icon={<Send size={22} color="#FFFFFF" />} label="Compartir" onClick={onShare} />
      <ActionButton
        icon={<Bookmark size={24} fill={saved ? "#FFFFFF" : "none"} color="#FFFFFF" />}
        label="Guardar"
        onClick={onToggleSave}
      />
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {icon}
      <span style={textStyle(TYPE.metadata, { color: "#FFFFFF", textShadow: "0 1px 3px rgba(0,0,0,0.4)" })}>
        {label}
      </span>
    </button>
  );
}
