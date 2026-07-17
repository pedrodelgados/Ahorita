import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSavedEvents } from "../../contexts/SavedEventsContext";
import { CHANNEL_COLORS, CHANNELS, COLORS, photoOverlay, textStyle, TYPE } from "../../styles/theme";
import { googleMapsDirectionsUrl } from "../../lib/directions";
import { formatEventDateTime } from "../../lib/time";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import LocationMetadata from "../../components/ui/LocationMetadata";
import SocialActions from "./SocialActions";

// Ritmo editorial: cada variante define cuánto "aire" y peso tipográfico
// recibe la tarjeta. Ver getCardVariant en lib/feed.js — la variante viene
// siempre de datos reales (posición/etiqueta/medio), nunca inventada aquí.
const VARIANT_STYLES = {
  portada: { height: "88svh", title: TYPE.cardTitlePortada, kicker: true, description: false, actionsBottom: 150 },
  destacado: { height: "82svh", title: TYPE.cardTitleFeatured, kicker: true, description: true, actionsBottom: 140, ring: true },
  historia: { height: "82svh", title: TYPE.cardTitle, kicker: false, description: false, actionsBottom: 140 },
  rapida: { height: "54svh", title: TYPE.cardTitleCompact, kicker: false, description: false, actionsBottom: 96 },
  normal: { height: "74svh", title: TYPE.cardTitle, kicker: false, description: true, actionsBottom: 140 },
};

export default function FeedCard({ item, liked, likeCount, isOpen, onToggleLike, onOpenEvent }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { savedIds, toggleSave } = useSavedEvents();
  const [videoFailed, setVideoFailed] = useState(false);
  const channelColor = CHANNEL_COLORS[item.channel] ?? COLORS.accent;
  const channelLabel = CHANNELS.find((c) => c.id === item.channel)?.label;
  const isSaved = savedIds.has(item.eventId);
  const isPaid = item.price != null && Number(item.price) > 0;
  const isVideo = item.mediaType === "video" && item.mediaUrl && !videoFailed;
  const v = VARIANT_STYLES[item.variant] ?? VARIANT_STYLES.normal;

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
      url: window.location.origin + "/",
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
        height: v.height,
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        marginBottom: 16,
        background: "#1c1a18",
        scrollSnapAlign: "start",
        flexShrink: 0,
        boxShadow: v.ring ? `inset 0 0 0 2px ${channelColor}` : "none",
      }}
    >
      {isVideo ? (
        <video
          src={item.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <ImageWithFallback
          src={item.image}
          alt={item.title}
          iconSize={32}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // Nombre de transición compartido: solo lo conserva la tarjeta
            // mientras su ficha NO está abierta, para que al abrirse el
            // EventSheet (mismo nombre) el navegador anime una sola imagen
            // "expandiéndose" en vez de mostrar dos elementos a la vez.
            viewTransitionName: isOpen ? "none" : `ahorita-event-${item.eventId}`,
          }}
        />
      )}

      <div style={{ position: "absolute", inset: 0, background: photoOverlay() }} />

      {item.tag && (
        <span
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: channelColor,
            color: "#FFFFFF",
            padding: "6px 13px",
            borderRadius: "var(--radius-full)",
            ...textStyle(TYPE.label, { letterSpacing: 0.5 }),
          }}
        >
          {item.tag}
        </span>
      )}

      <SocialActions
        liked={liked}
        likeCount={likeCount}
        commentCount={item.commentsCount}
        saved={isSaved}
        bottom={v.actionsBottom}
        onToggleLike={() => requireAuth(onToggleLike)}
        onOpenComments={() => onOpenEvent(item.eventId)}
        onShare={handleShare}
        onToggleSave={() => requireAuth(() => toggleSave(item.eventId))}
      />

      {/* Contenido inferior */}
      <div style={{ position: "absolute", left: 16, right: 84, bottom: 20, color: "#FFFFFF" }}>
        <LocationMetadata
          location={item.location}
          meta={formatEventDateTime(item.startAt)}
          style={{ marginBottom: 6 }}
        />
        {v.kicker && channelLabel && (
          <p style={textStyle(TYPE.kicker, { color: "#FFFFFF", opacity: 0.85, margin: "0 0 2px" })}>
            {channelLabel}
          </p>
        )}
        <h2 style={textStyle(v.title, { color: "#FFFFFF", marginBottom: 6 })}>{item.title}</h2>
        {v.description && item.description && (
          <p
            style={textStyle(TYPE.bodySmall, {
              color: "#FFFFFF",
              margin: "0 0 12px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              opacity: 0.95,
            })}
          >
            {item.description}
          </p>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.lat && item.lng && (
            <PillButton href={googleMapsDirectionsUrl(item.lat, item.lng)}>Cómo llegar</PillButton>
          )}
          {isPaid && item.ticketUrl && <PillButton href={item.ticketUrl}>Comprar entradas</PillButton>}
          <PillButton onClick={() => onOpenEvent(item.eventId)} solid>
            Más información
          </PillButton>
        </div>
      </div>
    </section>
  );
}

function PillButton({ href, onClick, solid, children }) {
  const style = {
    padding: "9px 15px",
    borderRadius: "var(--radius-full)",
    border: "none",
    background: solid ? COLORS.accent : "rgba(255, 255, 255, 0.18)",
    color: "#FFFFFF",
    backdropFilter: solid ? "none" : "blur(6px)",
    whiteSpace: "nowrap",
    ...textStyle(TYPE.metadata, { fontWeight: 600 }),
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
