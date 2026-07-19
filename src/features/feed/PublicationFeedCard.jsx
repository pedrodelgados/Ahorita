import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getMyPublicationInteractions,
  getPublicationInteractionCounts,
  togglePublicationInteraction,
  describeInteractionError,
} from "../../lib/interactions";
import { COLORS, photoOverlay, textStyle, TYPE } from "../../styles/theme";
import { formatRelativeTime } from "../../lib/time";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import VerificationBadge from "../profile/VerificationBadge";
import SocialActions from "./SocialActions";

// Fase 4, Bloque 2: tarjeta separada de FeedCard a propósito — una
// Publicación es más liviana (sin fecha propia, sin entradas, sin "cómo
// llegar") y mezclarla dentro de FeedCard habría obligado a llenar ese
// componente ya probado de condicionales ajenos a los eventos. La jerarquía
// visual mínima exigida al convivir dos tipos por primera vez (ver
// FASE4_CONTRATO_ARQUITECTONICO.md) es esta misma etiqueta de tipo, siempre
// visible, más la insignia de verificación del autor.
export default function PublicationFeedCard({ item }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ meGusta: 0, guardados: 0 });
  const [mine, setMine] = useState({ meGusta: false, guardado: false });
  const [busy, setBusy] = useState({ meGusta: false, guardado: false });
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPublicationInteractionCounts(item.publicationId).then((c) => {
      if (!cancelled) setCounts(c);
    });
    if (isAuthenticated) {
      getMyPublicationInteractions(user.id, item.publicationId).then((m) => {
        if (!cancelled) setMine(m);
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.publicationId, isAuthenticated]);

  function requireAuth(action) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    action();
  }

  async function toggle(type, key) {
    if (busy[key]) return;
    const wasActive = mine[key];
    setBusy((prev) => ({ ...prev, [key]: true }));
    setError(null);
    setMine((prev) => ({ ...prev, [key]: !wasActive }));
    setCounts((prev) => ({
      ...prev,
      [key === "meGusta" ? "meGusta" : "guardados"]:
        prev[key === "meGusta" ? "meGusta" : "guardados"] + (wasActive ? -1 : 1),
    }));
    try {
      await togglePublicationInteraction({
        viewerProfileId: user.id,
        publicationId: item.publicationId,
        type,
        active: wasActive,
      });
    } catch (err) {
      setMine((prev) => ({ ...prev, [key]: wasActive }));
      setCounts((prev) => ({
        ...prev,
        [key === "meGusta" ? "meGusta" : "guardados"]:
          prev[key === "meGusta" ? "meGusta" : "guardados"] + (wasActive ? 1 : -1),
      }));
      setError(describeInteractionError(err));
    } finally {
      setBusy((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleShare() {
    const shareData = {
      title: item.title,
      text: item.description,
      url: window.location.origin + "/",
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* el usuario canceló, no hacer nada */
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
    }
  }

  const isLongText = (item.description || "").length > 140;

  return (
    <section
      style={{
        position: "relative",
        minHeight: item.image ? "60svh" : "auto",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        marginBottom: 16,
        background: item.image ? "#1c1a18" : COLORS.surface,
        scrollSnapAlign: "start",
        flexShrink: 0,
      }}
    >
      {item.image && (
        <>
          <ImageWithFallback
            src={item.image}
            alt={item.title}
            iconSize={28}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: photoOverlay() }} />
        </>
      )}

      <span
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "rgba(0,0,0,0.35)",
          color: "#FFFFFF",
          padding: "6px 13px",
          borderRadius: "var(--radius-full)",
          backdropFilter: "blur(4px)",
          ...textStyle(TYPE.label, { letterSpacing: 0.5 }),
        }}
      >
        Publicación
      </span>

      <SocialActions
        liked={mine.meGusta}
        likeCount={counts.meGusta}
        saved={mine.guardado}
        showComments={false}
        bottom={120}
        onToggleLike={() => requireAuth(() => toggle("me_gusta", "meGusta"))}
        onShare={handleShare}
        onToggleSave={() => requireAuth(() => toggle("guardado", "guardado"))}
      />

      <div
        style={{
          position: item.image ? "absolute" : "static",
          left: 16,
          right: 84,
          bottom: 20,
          color: item.image ? "#FFFFFF" : COLORS.ink,
          padding: item.image ? 0 : "16px 16px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <p style={textStyle(TYPE.kicker, { color: "inherit", opacity: 0.9, margin: 0 })}>{item.title}</p>
          <VerificationBadge status={item.verificationBadge} />
        </div>
        <p
          style={textStyle(TYPE.bodySmall, {
            color: "inherit",
            margin: "0 0 12px",
            opacity: 0.95,
            ...(expanded
              ? {}
              : { display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }),
          })}
        >
          {item.description}
        </p>
        {isLongText && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            style={{ background: "none", border: "none", padding: 0, color: "inherit", opacity: 0.8 }}
          >
            <span style={textStyle(TYPE.metadata, { color: "inherit", fontWeight: 700 })}>Ver más</span>
          </button>
        )}
        <p style={textStyle(TYPE.metadata, { color: "inherit", opacity: 0.7, margin: "8px 0 0" })}>
          {formatRelativeTime(item.publishedAt)}
          {item.edited ? " · Editado" : ""}
        </p>
        {error && (
          <p style={textStyle(TYPE.metadata, { color: item.image ? "#FFD9D9" : COLORS.error, margin: "6px 0 0" })}>
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
