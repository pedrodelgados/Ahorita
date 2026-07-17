import { Heart, MessageCircle, Send, Bookmark, MapPin } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSavedPlaces } from "../../contexts/SavedPlacesContext";
import { CHANNEL_COLORS, COLORS } from "../../styles/theme";
import { googleMapsDirectionsUrl } from "../../lib/directions";
import { formatRelativeTime } from "../../lib/time";

export default function FeedCard({ item, liked, likeCount, onToggleLike, onOpenPlace }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { savedIds, toggleSave } = useSavedPlaces();
  const channelColor = CHANNEL_COLORS[item.channel] ?? COLORS.accent;
  const isSaved = item.placeId && savedIds.has(item.placeId);

  function requireAuth(action) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    action();
  }

  async function handleShare() {
    const shareData = {
      title: item.title,
      text: item.description || item.title,
      url: window.location.origin + "/explorar",
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* el usuario canceló el share, no hacer nada */
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
    }
  }

  return (
    <section
      style={{
        position: "relative",
        height: "82svh",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        marginBottom: 16,
        background: "#111",
        scrollSnapAlign: "start",
        flexShrink: 0,
      }}
    >
      {item.mediaType === "video" && item.image ? (
        <video
          src={item.image}
          autoPlay
          muted
          loop
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <img
          src={item.image}
          alt={item.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      {item.tag && (
        <span
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: channelColor,
            color: "#FFFFFF",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.4,
            padding: "5px 12px",
            borderRadius: "var(--radius-full)",
          }}
        >
          {item.tag}
        </span>
      )}

      {/* Acciones verticales */}
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 130,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <ActionButton
          icon={<Heart size={24} fill={liked ? COLORS.accent : "none"} color={liked ? COLORS.accent : "#FFFFFF"} />}
          label={likeCount > 0 ? String(likeCount) : "Me gusta"}
          onClick={() => requireAuth(onToggleLike)}
        />
        {item.placeId && (
          <ActionButton
            icon={<MessageCircle size={24} color="#FFFFFF" />}
            label="Comentar"
            onClick={() => onOpenPlace(item.placeId)}
          />
        )}
        <ActionButton icon={<Send size={22} color="#FFFFFF" />} label="Compartir" onClick={handleShare} />
        {item.placeId && (
          <ActionButton
            icon={<Bookmark size={24} fill={isSaved ? "#FFFFFF" : "none"} color="#FFFFFF" />}
            label="Guardar"
            onClick={() => requireAuth(() => toggleSave(item.placeId))}
          />
        )}
      </div>

      {/* Contenido inferior */}
      <div style={{ position: "absolute", left: 16, right: 84, bottom: 20, color: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
          <MapPin size={12} />
          {item.location}
          <span>· {formatRelativeTime(item.createdAt)}</span>
        </div>
        <h2 style={{ fontSize: 21, marginBottom: 6, lineHeight: 1.15 }}>{item.title}</h2>
        {item.description && (
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.4,
              margin: "0 0 12px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              opacity: 0.95,
            }}
          >
            {item.description}
          </p>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.lat && item.lng && (
            <PillButton href={googleMapsDirectionsUrl(item.lat, item.lng)}>Cómo llegar</PillButton>
          )}
          {item.ticketsUrl && <PillButton href={item.ticketsUrl}>Comprar entradas</PillButton>}
          {item.menuUrl && <PillButton href={item.menuUrl}>Ver menú</PillButton>}
          {item.placeId && (
            <PillButton onClick={() => onOpenPlace(item.placeId)} solid>
              Más información
            </PillButton>
          )}
        </div>
      </div>
    </section>
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
      <span style={{ fontSize: 10, color: "#FFFFFF", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{label}</span>
    </button>
  );
}

function PillButton({ href, onClick, solid, children }) {
  const style = {
    padding: "8px 14px",
    borderRadius: "var(--radius-full)",
    fontSize: 12.5,
    fontWeight: 600,
    border: "none",
    background: solid ? COLORS.accent : "rgba(255, 255, 255, 0.18)",
    color: "#FFFFFF",
    backdropFilter: solid ? "none" : "blur(6px)",
    whiteSpace: "nowrap",
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" style={style}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
}
